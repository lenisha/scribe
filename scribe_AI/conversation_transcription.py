import os
import time
import wave
from tqdm import tqdm
import azure.cognitiveservices.speech as speechsdk

def recognize_from_file(input_filename, output_filename):
    # Retrieve subscription info from environment variables
    subscription_key = os.environ.get('SPEECH_KEY')
    region = os.environ.get('SPEECH_REGION')

    if not subscription_key or not region:
        raise ValueError("Environment variables SPEECH_KEY and SPEECH_REGION must be set and non-empty.")

    # Configure speech recognition
    speech_config = speechsdk.SpeechConfig(subscription=subscription_key, region=region)
    speech_config.speech_recognition_language = "fr-CA"
    speech_config.set_property(
        property_id=speechsdk.PropertyId.SpeechServiceResponse_DiarizeIntermediateResults, value='true'
    )
    audio_config = speechsdk.audio.AudioConfig(filename=input_filename)
    conversation_transcriber = speechsdk.transcription.ConversationTranscriber(
        speech_config=speech_config, audio_config=audio_config
    )

    transcribing_stop = False

    # Initialize transcription_list to collect results
    transcription_list = []

    # Get total duration of the audio file
    with wave.open(input_filename, 'rb') as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        total_duration_sec = frames / float(rate)

    # Initialize progress bar for transcription
    pbar = tqdm(total=total_duration_sec, unit='s', desc='Transcribing', leave=False)

    last_offset = 0  # To keep track of progress

    def stop_cb(evt: speechsdk.SessionEventArgs):
        # Callback that signals to stop continuous recognition upon receiving an event `evt`
        nonlocal transcribing_stop
        transcribing_stop = True

    # Define event handlers
    def conversation_transcriber_transcribed_cb(evt: speechsdk.SpeechRecognitionEventArgs):
        nonlocal transcription_list
        nonlocal last_offset
        if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
            text = evt.result.text
            speaker_id = evt.result.speaker_id
            transcription_list.append(f"Speaker {speaker_id}: {text}")

            # Update progress bar
            offset_seconds = evt.result.offset / 10_000_000  # Convert ticks to seconds
            if offset_seconds > last_offset:
                increment = offset_seconds - last_offset
                pbar.update(increment)
                last_offset = offset_seconds

        elif evt.result.reason == speechsdk.ResultReason.NoMatch:
            pass  # Handle no match if desired

    def conversation_transcriber_transcribing_cb(evt: speechsdk.SpeechRecognitionEventArgs):
        pass  # Implement if you want to process intermediate results

    def conversation_transcriber_session_started_cb(evt: speechsdk.SessionEventArgs):
        # Event handler for session started
        pass  # Can be used to log session start if needed

    def conversation_transcriber_session_stopped_cb(evt: speechsdk.SessionEventArgs):
        # On session stopped, update and close progress bar
        pbar.n = pbar.total
        pbar.refresh()
        pbar.close()

    def conversation_transcriber_recognition_canceled_cb(evt: speechsdk.SessionEventArgs):
        # On cancellation, close the progress bar
        pbar.close()

    # Connect callbacks to the events fired by the conversation transcriber
    conversation_transcriber.transcribed.connect(conversation_transcriber_transcribed_cb)
    conversation_transcriber.transcribing.connect(conversation_transcriber_transcribing_cb)
    conversation_transcriber.session_started.connect(conversation_transcriber_session_started_cb)
    conversation_transcriber.session_stopped.connect(conversation_transcriber_session_stopped_cb)
    conversation_transcriber.canceled.connect(conversation_transcriber_recognition_canceled_cb)
    # Stop transcribing on either session stopped or canceled events
    conversation_transcriber.session_stopped.connect(stop_cb)
    conversation_transcriber.canceled.connect(stop_cb)

    conversation_transcriber.start_transcribing_async()

    # Wait for completion
    while not transcribing_stop:
        time.sleep(0.5)

    conversation_transcriber.stop_transcribing_async()

    # After transcription is complete, write results to output file
    with open(output_filename, 'w', encoding='utf-8') as f:
        for line in transcription_list:
            f.write(line + '\n')

    pbar.close()