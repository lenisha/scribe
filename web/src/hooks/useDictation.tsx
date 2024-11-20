import { useCallback, useContext, useEffect, useState } from 'react';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

import { NoteContext } from '@/context/note-context/NoteContext';

import {
  Microphone,
  MicrophoneList,
  MicrophoneProperties,
  createSpeechTranscriber,
  enumerateMicrophones,
} from '../utils/speech';

export default function useDictation() {
  const { selectedLanguage, updateStartTime, updateEndTime, addNoteText, clearAllText } =
    useContext(NoteContext);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [transcriber, setTranscriber] = useState<SpeechSDK.ConversationTranscriber | null>(null);
  const [selectedMic, setSelectedMic] = useState<Microphone[MicrophoneProperties.DEVICE_ID]>('');
  const [microphones, setMicrophones] = useState<MicrophoneList>([]);

  const checkSelectedMicAvailable = useCallback(
    (newMics: MicrophoneList) => {
      const micStillAvailable = newMics.find((mic) => mic.deviceId === selectedMic);
      if (!micStillAvailable) {
        setSelectedMic(() => '');
      }
    },
    [selectedMic],
  );

  const micsEqualToCurrentMics = useCallback((newMics: MicrophoneList, oldMics: MicrophoneList) => {
    return (
      newMics.length === oldMics.length &&
      newMics.every((element_1) => {
        oldMics.some((element_2) => {
          element_1.label === element_2.label && element_1.deviceId === element_2.deviceId;
        });
      })
    );
  }, []);

  const getMicrophones = useCallback(() => {
    const fetchMics = async () => {
      const mics = await enumerateMicrophones();

      if (!mics || mics.length <= 0) {
        setMicrophones(() => []);
        setSelectedMic(() => '');
        return;
      }

      const shouldUpdateMics = !micsEqualToCurrentMics(mics, microphones);

      if (shouldUpdateMics) {
        setMicrophones(() => mics);
        checkSelectedMicAvailable(mics);
      }
    };
    fetchMics();
  }, [checkSelectedMicAvailable, microphones, micsEqualToCurrentMics]);

  useEffect(() => {
    getMicrophones();
    // This useEffect should only be run once on mount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onRecognizing(recognitionEventArgs: SpeechSDK.ConversationTranscriptionEventArgs) {
    const result = recognitionEventArgs.result;
    const text = result.text;
    const speakerId = result.speakerId || 'Unknown';
    console.log(`(recognizing) [Speaker ${speakerId}]: ${text}`);
    setCurrentText(`[Speaker ${speakerId}]: ${text}`);
  }

  function onRecognized(recognitionEventArgs: SpeechSDK.ConversationTranscriptionEventArgs) {
    const result = recognitionEventArgs.result;
    const text = result.text;
    const speakerId = result.speakerId || 'Unknown';
    console.log(
      `(recognized) Reason: ${SpeechSDK.ResultReason[result.reason]}` +
        `Text: ${result.text}` +
        `SpeakerId: ${speakerId}`,
    );

    switch (result.reason) {
      case SpeechSDK.ResultReason.NoMatch:
        break;
      case SpeechSDK.ResultReason.Canceled:
        break;
      case SpeechSDK.ResultReason.RecognizedSpeech:
      case SpeechSDK.ResultReason.TranslatedSpeech:
      case SpeechSDK.ResultReason.RecognizedIntent:
        if (text && text.trim() !== '') {
          addNoteText(`[Speaker ${speakerId}]: ${text}` + '\r\n');
          setCurrentText('');
        }
        break;
    }
  }

  function onCanceled(event: SpeechSDK.SpeechRecognitionCanceledEventArgs) {
    console.log('Canceled: ', event.errorDetails);
    console.log(`(cancel) Reason: ` + SpeechSDK.CancellationReason[event.reason]);
  }

  function onSessionStarted(event: SpeechSDK.SessionEventArgs) {
    console.log(`Session started. ${event.sessionId}`);
  }

  function onSessionStopped(event: SpeechSDK.SessionEventArgs) {
    console.log(`Session stopped. ${event.sessionId}`);
  }

  const startContinuousDictation = async () => {
    console.log(`Starting continuous dictation ${selectedMic} ${selectedLanguage}`);
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    const transcriber = await createSpeechTranscriber(selectedLanguage, selectedMic);
    if (transcriber) {
      transcriber.transcribing = (_, e) => onRecognizing(e);
      transcriber.transcribed = (_, e) => onRecognized(e);

      transcriber.canceled = (_, e) => onCanceled(e);
      transcriber.sessionStarted = (_, e) => onSessionStarted(e);
      transcriber.sessionStopped = (_, e) => onSessionStopped(e);

      setTranscriber(transcriber);
      transcriber.startTranscribingAsync();
      setIsTranscribing(true);

      setCurrentText('');
      clearAllText();
      updateStartTime(new Date()); // Set start time
    } else {
      console.error('Failed to create recognizer.');
    }
  };

  const stopDictation = () => {
    setIsTranscribing(false);

    if (transcriber) {
      transcriber.stopTranscribingAsync();
      transcriber.close();
      setTranscriber(null);
      updateEndTime(new Date()); // Set end time
    }
  };

  const updateSelectedMic = (newMic: string) => {
    setSelectedMic(() => newMic);
  };

  return {
    currentText,
    microphones,
    selectedMic,
    isTranscribing,
    startContinuousDictation,
    stopDictation,
    updateSelectedMic,
    getMicrophones,
  };
}
