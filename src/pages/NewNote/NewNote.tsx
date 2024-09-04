import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Meta from '@/components/Meta';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { TextField, Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import { FlexBox } from '@/components/styled';
import { useState } from 'react';
import { createSpeechRecognizer } from './speech_utils'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


function NewNote() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [soapText, setSoapText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [recognizer, setRecognizer] = useState<SpeechSDK.SpeechRecognizer | null>(null);


  function onRecognizing(sender: SpeechSDK.Recognizer, recognitionEventArgs: SpeechSDK.SpeechRecognitionEventArgs) {
      var result = recognitionEventArgs.result;
      console.log(`(recognizing) Reason: ${SpeechSDK.ResultReason[result.reason]}`  + `Text: ${result.text}`);
      setCurrentText(result.text);
  }

  function onRecognized(sender: SpeechSDK.Recognizer, recognitionEventArgs: SpeechSDK.SpeechRecognitionEventArgs) {
      var result = recognitionEventArgs.result;
      console.log(`(recognized) Reason: ${SpeechSDK.ResultReason[result.reason]}` + `Text: ${result.text}`);

      switch (result.reason) {
        case SpeechSDK.ResultReason.NoMatch:
            var noMatchDetail = SpeechSDK.NoMatchDetails.fromResult(result);
            console.log("NoMatchReason: ${SpeechSDK.NoMatchReason[noMatchDetail.reason]}\r\n");
            break;
        case SpeechSDK.ResultReason.Canceled:
            var cancelDetails = SpeechSDK.CancellationDetails.fromResult(result);
            console.log(`CancellationReason: ${SpeechSDK.CancellationReason[cancelDetails.reason]}`
                + (cancelDetails.reason === SpeechSDK.CancellationReason.Error ? `: ${cancelDetails.errorDetails}` : ``)
                + `\r\n`);
            break;
        case SpeechSDK.ResultReason.RecognizedSpeech:
        case SpeechSDK.ResultReason.TranslatedSpeech:
        case SpeechSDK.ResultReason.RecognizedIntent:
            setNoteText(prevText => prevText + result.text + '\r\n');
            setCurrentText('');
            break;
    }
    
  }

  function onCanceled(sender: SpeechSDK.Recognizer,  event: SpeechSDK.SpeechRecognitionCanceledEventArgs) {
      console.log('Canceled: ', event.errorDetails);
      console.log(`(cancel) Reason: ` + SpeechSDK.CancellationReason[event.reason]);
  }
   
  function onSessionStarted(sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) {
      console.log(`Session started. ${event.sessionId}`);
  }

  function onSessionStopped(sender: SpeechSDK.Recognizer, event: SpeechSDK.SessionEventArgs) {
      console.log(`Session stopped. ${event.sessionId}`);
      
  }


  const startContinuosDictation = () => {
    setIsTranscribing(true);
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    const recognizer = createSpeechRecognizer();
    if (recognizer) {

      recognizer.recognizing = (s, e) => onRecognizing(s, e);
      recognizer.recognized = (s, e) => onRecognized(s, e);
      recognizer.canceled = (s, e) => onCanceled(s,e);
      recognizer.sessionStarted = (s, e) => onSessionStarted(s,e);
      recognizer.sessionStopped = (s, e) => onSessionStopped(s, e);
 
      setRecognizer(recognizer);
      recognizer.startContinuousRecognitionAsync();
      
      setCurrentText('');
      setNoteText('');

    } else {
      console.error('Failed to create recognizer.');
    }
  }

  const stopDictation = () => {
    setIsTranscribing(false);

    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync();
      recognizer.close();
      setRecognizer(null);
    }
  };

  const handleMicButtonClick = () => {
    if (isTranscribing) {
      stopDictation();
    } else {
      startContinuosDictation();
    }
  };



  return (
    <>
      <Meta title="New Note" />
      <Box sx={{ flexDirection: 'column', display: 'flex', justifyContent: 'center',  alignItems: 'stretch', height: '90%' , width:'100%'}}>
        <Box sx={{ display: 'flex', justifyContent: 'center', width:'100%'}}>
          <Typography variant="h5" sx={{ gap: 2 , align:"center"}}>Dictate New Note</Typography>
        </Box>
        <Box sx={{ flexDirection: 'row', display: 'flex', flexWrap: 'wrap', m:2, gap:2,  height: '90%' , width:'100%'}}>
             <Card sx={{ width: '45%', height: '100%' }}>
                <CardContent>
                  <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    Dictated Notes
                  </Typography>
                  <TextField  
                    multiline
                    rows={20}
                    variant="outlined"
                    fullWidth
                    value={noteText + currentText}
                    onChange={(e) => setNoteText(e.target.value)}
                    sx={{ height: '100%' , overflow: 'auto'  }}
                  />
                 </CardContent>
                <CardActions sx={{ m:2 }}>
                    <FlexBox sx={{ alignItems: 'center' }}>
                    <Tooltip title={isTranscribing ? "Stop" : "Start"} arrow>
                      <Button variant="contained" 
                              color={isTranscribing ? "warning" : "primary"}
                              startIcon={isTranscribing ?<MicOffIcon/> :<MicIcon />} 
                              onClick={handleMicButtonClick}>
                        {isTranscribing ? "Stop Transcription" : "Start Transcription"}
                      </Button>
                    </Tooltip>
                    </FlexBox>
                    <Tooltip title="AI Generate SOAP" arrow>
                        <Button variant="contained" color="primary" 
                                sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                                endIcon={<KeyboardArrowRightIcon/>}>
                          AI Generate
                        </Button>
                    </Tooltip>
                </CardActions>
                </Card> 
              
        
            
              <Card sx={{ width: '45%', height: '100%' }}>
                <CardContent>
                 <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                    SOAP Note
                  </Typography>
                  <TextField
                    multiline
                    rows={20}
                    variant="outlined"
                    fullWidth
                    sx={{ height: '100%' , overflow: 'auto'  }}
                  />
                </CardContent>
                </Card> 
           
         
        </Box>    
      </Box>
    </>
  );
}

export default NewNote;
