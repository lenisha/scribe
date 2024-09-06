import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import Cookie from 'universal-cookie';
import axios, { AxiosInstance } from 'axios';
import config from "@/services/config";

async function createSpeechRecognizer( ) : Promise<SpeechSDK.SpeechRecognizer | null> {
    var audioConfig = getAudioConfig();
    var speechConfig = await getSpeechConfig(SpeechSDK.SpeechConfig);
    if (!speechConfig) {
        console.error('Failed to create speech config.');
        return null;
    }
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    return new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
   
}

async function createSpeechTranscriber( ) : Promise<SpeechSDK.ConversationTranscriber | null>  {
    var audioConfig = getAudioConfig();
    var speechConfig = await getSpeechConfig(SpeechSDK.SpeechConfig);
    if (!speechConfig) {
        console.error('Failed to create speech config.');
        return null;
    }
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    return new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
   
}

function getAudioConfig() {
    // If an audio file was specified, use it. Otherwise, use the microphone.
    // Depending on browser security settings, the user may be prompted to allow microphone use. Using
    // continuous recognition allows multiple phrases to be recognized from a single use authorization.
    let microphoneSources = enumerateMicrophones();
    if (microphoneSources) {
        return SpeechSDK.AudioConfig.fromMicrophoneInput(microphoneSources[0]);
    } else {
        return SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    }
}

async function getSpeechConfig(sdkConfigType: typeof SpeechSDK.SpeechConfig) {
    var speechConfig;
    
    let key =  config.api.key;
    let region = config.api.region;

    // If a custom base URL is specified, use it to get the token from the back-end
    if (config.api.baseUrl) {
        console.log('Using custom base URL to get token: ' + config.api.baseUrl);
        const authorizationToken =  await getTokenOrRefresh();
        if (!authorizationToken) {
            console.error('Failed to get token from back-end.');
            alert("Please validate your backend configuration.");
            return undefined;
        }
        speechConfig = sdkConfigType.fromAuthorizationToken(authorizationToken, region);
        if (!speechConfig) {
            console.error('Failed to create speech config.');
            alert("Please validate your backend configuration.");
            return undefined;
        }

    } 
    // If a key is not specified, use the default subscription key
    else if (!key) {
        console.error('Please enter your Cognitive Services Speech subscription key!');
        alert("Please enter your Cognitive Services Speech subscription key!");
        return undefined;
    } else {
        console.log(`Connecting using key and reion: ${key.slice(0,4)} ${region}`);
        speechConfig = sdkConfigType.fromSubscription(key, region);
    }
    
    speechConfig.outputFormat = SpeechSDK.OutputFormat.Simple;
    speechConfig.speechRecognitionLanguage = "en-US";
    return speechConfig;
}





function enumerateMicrophones() {
    let microphoneSources: string[] = [];

    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log(`Unable to query for audio input devices. Default will be used.\r\n`);
        return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {

        // Not all environments will be able to enumerate mic labels and ids. All environments will be able
        // to select a default input, assuming appropriate permissions.
        for (const device of devices) {
            if (device.kind === "audioinput") {
                if (!device.deviceId) {
                    window.console.log(
                        `Warning: unable to enumerate a microphone deviceId. This may be due to limitations`
                        + ` with availability in a non-HTTPS context per mediaDevices constraints.`); 
                }
                else {
                    var opt = document.createElement('option');
                   console.log("Device found:" + device.deviceId)
                   console.log("Device label:" + device.label);

                    microphoneSources.push(device.deviceId);
                }
            }
        }

    });
    return microphoneSources;
}

async function getTokenOrRefresh() : Promise<string> {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    if (speechToken === undefined || speechToken === null || speechToken === '') {
        try {
         
            const res = await axios.get(config.api.baseUrl + '/api/get-speech-token');
            const token = res.data.token;
            const region = res.data.region;
            cookie.set('speech-token', region + ':' + token, {maxAge: 540, path: '/'});

            console.log('Token fetched from back-end: ' + token + ' region:' + region);
            return token;
        } catch (err) {
            console.log(err);
            return '';
        }
    } else {
        console.log('Token fetched from cookie: ' + speechToken);
        const idx = speechToken.indexOf(':');
        return  speechToken.slice(idx + 1);
    }
}

function applyCommonConfigurationTo(recognizer: SpeechSDK.SpeechRecognizer,
                 onRecognized: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SpeechRecognitionEventArgs) => void, 
                 onRecognizing: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SpeechRecognitionEventArgs) => void, 
                 onCanceled: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SpeechRecognitionCanceledEventArgs) => void, 
                 onSessionStarted: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) => void, 
                 onSessionStopped: (sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) => void) {                                
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

export { getAudioConfig, getSpeechConfig, enumerateMicrophones, createSpeechRecognizer, createSpeechTranscriber, applyCommonConfigurationTo };