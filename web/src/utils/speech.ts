import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import Cookie from 'universal-cookie';

import config from '@/services/config';

export enum MicrophoneProperties {
  LABEL = 'label',
  DEVICE_ID = 'deviceId',
}

export interface Microphone {
  [MicrophoneProperties.LABEL]: string;
  [MicrophoneProperties.DEVICE_ID]: string;
}

export type MicrophoneList = Microphone[];

async function createSpeechRecognizer(): Promise<SpeechSDK.SpeechRecognizer | null> {
  const audioConfig = getAudioConfig();
  const speechConfig = await getSpeechConfig(SpeechSDK.SpeechConfig);
  if (!speechConfig) {
    console.error('Failed to create speech config.');
    return null;
  }
  // Create the SpeechRecognizer and set up common event handlers and PhraseList data
  return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
}

async function createSpeechTranscriber(
  language?: string,
  deviceMic?: string,
): Promise<SpeechSDK.ConversationTranscriber | null> {
  const audioConfig = getAudioConfig(deviceMic);
  const speechConfig = await getSpeechConfig(SpeechSDK.SpeechConfig);
  if (!speechConfig) {
    console.error('Failed to create speech config.');
    return null;
  }
  speechConfig.speechRecognitionLanguage = language ? language : 'en-CA';
  // Create the SpeechRecognizer and set up common event handlers and PhraseList data
  return new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
}

function getAudioConfig(deviceMic?: string) {
  // If an audio file was specified, use it. Otherwise, use the microphone.
  // Depending on browser security settings, the user may be prompted to allow microphone use. Using
  // continuous recognition allows multiple phrases to be recognized from a single use authorization.

  if (deviceMic) {
    return SpeechSDK.AudioConfig.fromMicrophoneInput(deviceMic);
  } else {
    return SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  }
}

async function getSpeechConfig(sdkConfigType: typeof SpeechSDK.SpeechConfig) {
  let speechConfig;

  const key = config.api.key;

  // If a custom base URL is specified, use it to get the token from the back-end
  if (config.api.baseUrl) {
    console.log('Using custom base URL to get token: ' + config.api.baseUrl);
    const { token, region } = await getTokenOrRefresh();
    // Now you can use both token and region
    console.log(`Retrieved Token: ${token.slice(0, 4)}, Region: ${region}`);
    if (!token) {
      console.error('Failed to get token from back-end.');
      alert('Please validate your backend configuration.');
      return undefined;
    }
    speechConfig = sdkConfigType.fromAuthorizationToken(token, region);
    if (!speechConfig) {
      console.error('Failed to create speech config.');
      alert('Please validate your backend configuration.');
      return undefined;
    }
  }
  // If a key is not specified, use the default subscription key
  else if (!key) {
    console.error('Please enter your Cognitive Services Speech subscription key!');
    alert('Please enter your Cognitive Services Speech subscription key!');
    return undefined;
  } else {
    const region = config.api.region;
    console.log(`Connecting using key and reion: ${key.slice(0, 4)} ${region}`);
    speechConfig = sdkConfigType.fromSubscription(key, region);
  }

  speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;

  return speechConfig;
}

async function enumerateMicrophones(): Promise<MicrophoneList> {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    console.error('Microphone permission denied.');
    return [];
  }

  const microphoneSources: MicrophoneList = [];

  if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log(`Unable to query for audio input devices. Default will be used.\r\n`);
    return microphoneSources;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    // Not all environments will be able to enumerate mic labels and ids. All environments will be able
    // to select a default input, assuming appropriate permissions.
    for (const device of devices) {
      if (device.kind === 'audioinput') {
        if (!device.deviceId) {
          window.console.log(
            `Warning: unable to enumerate a microphone deviceId. This may be due to limitations` +
              ` with availability in a non-HTTPS context per mediaDevices constraints.`,
          );
        } else {
          microphoneSources.push({ label: device.label, deviceId: device.deviceId });
        }
      }
    }
  } catch (error) {
    console.error('Error enumerating devices:', error);
  }
  return microphoneSources;
}

async function getTokenOrRefresh(): Promise<{ token: string; region: string }> {
  const cookie = new Cookie();
  const speechToken = cookie.get('speech-token');

  if (speechToken === undefined || speechToken === null || speechToken === '') {
    try {
      const res = await axios.get(config.api.baseUrl + '/api/get-speech-token');
      const token = res.data.token;
      const region = res.data.region;
      cookie.set('speech-token', region + ':' + token, { maxAge: 540, path: '/' });

      return { token, region };
    } catch (err) {
      console.log(err);
      return { token: '', region: '' };
    }
  } else {
    const idx = speechToken.indexOf(':');
    const token = speechToken.slice(idx + 1);
    const region = speechToken.slice(0, idx);
    return { token, region };
  }
}

const DEFAULT_CONVERSATION = `Patient - Hello doctor, good morning.

Doctor - Good morning, have a seat. Please tell me what happened.

Patient - (showing the knee) For the past few months, I have been experiencing a severe pain in my left knee whenever I stand up or walk long distances.

Doctor - (checking the knee) Yes, it is slightly swollen, but probably nothing is broken. Can you please stand up for me?

Patient - (stands up) It really hurts when I try to stand after being seated for a while.

Doctor - Did you fall down or hit your knee somewhere?

Patient - No doctor, as far as I remember, I didn't hurt my knees.

Doctor - Okay, so I'm giving you Ibuprofen; it will help bring down the swelling and pain. Once the swelling goes down, you can take some tests which will help me judge why you have this constant pain. If you don't find Ibuprofen in the medical store, you can ask them to give you Paracetamol 600. It will also help ease the pain. Have the medicines for two days and come back for another check-up once the swelling is gone.

Patient - Sure doctor. Thank you.

Doctor - You are welcome.`;

function applyCommonConfigurationTo(
  recognizer: SpeechSDK.SpeechRecognizer,
  onRecognized: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SpeechRecognitionEventArgs) => void,
  onRecognizing: (
    sender: SpeechSDK.Recognizer,
    event: SpeechSDK.SpeechRecognitionEventArgs,
  ) => void,
  onCanceled: (
    sender: SpeechSDK.Recognizer,
    event: SpeechSDK.SpeechRecognitionCanceledEventArgs,
  ) => void,
  onSessionStarted: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) => void,
  onSessionStopped: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) => void,
) {
  // The 'recognizing' event signals that an intermediate recognition result is received.
  // Intermediate results arrive while audio is being processed and represent the current "best guess" about
  // what's been spoken so far.
  recognizer.recognizing = onRecognizing;

  // The 'recognized' event signals that a finalized recognition result has been received. These results are
  // formed across complete utterance audio (with either silence or eof at the end) and will include
  // punctuation, capitalization, and potentially other extra details.
  //
  // * In the case of continuous scenarios, these final results will be generated after each segment of audio
  //   with sufficient silence at the end.
  // * In the case of intent scenarios, only these final results will contain intent JSON data.
  // * Single-shot scenarios can also use a continuation on recognizeOnceAsync calls to handle this without
  //   event registration.
  recognizer.recognized = onRecognized;

  // The 'canceled' event signals that the service has stopped processing speech.
  // https://docs.microsoft.com/javascript/api/microsoft-cognitiveservices-speech-sdk/speechrecognitioncanceledeventargs?view=azure-node-latest
  // This can happen for two broad classes of reasons:
  // 1. An error was encountered.
  //    In this case, the .errorDetails property will contain a textual representation of the error.
  // 2. No additional audio is available.
  //    This is caused by the input stream being closed or reaching the end of an audio file.
  recognizer.canceled = onCanceled;

  // The 'sessionStarted' event signals that audio has begun flowing and an interaction with the service has
  // started.
  recognizer.sessionStarted = onSessionStarted;

  // The 'sessionStopped' event signals that the current interaction with the speech service has ended and
  // audio has stopped flowing.
  recognizer.sessionStopped = onSessionStopped;
}

export {
  getAudioConfig,
  getSpeechConfig,
  enumerateMicrophones,
  createSpeechRecognizer,
  createSpeechTranscriber,
  applyCommonConfigurationTo,
  DEFAULT_CONVERSATION,
};
