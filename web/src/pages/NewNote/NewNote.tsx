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
import { createSpeechTranscriber } from './speech_utils'
import { generateSOAPNotes } from './prompt_utils';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';


function NewNote() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [soapText, setSoapText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [transcriber, setTranscriber] = useState<SpeechSDK.ConversationTranscriber | null>(null);




  function onRecognizing(recognitionEventArgs: SpeechSDK.ConversationTranscriptionEventArgs)  {
      var result = recognitionEventArgs.result;
      var text = result.text;
      var speakerId = result.speakerId || 'Unknown';
      console.log(`(recognizing) [Speaker ${speakerId}]: ${text}`);
      setCurrentText(`[Speaker ${speakerId}]: ${text}`);
  }

  function onRecognized(recognitionEventArgs: SpeechSDK.ConversationTranscriptionEventArgs) {
      var result = recognitionEventArgs.result;
      var text = result.text;
      var speakerId = result.speakerId || 'Unknown';
      console.log(`(recognized) Reason: ${SpeechSDK.ResultReason[result.reason]}` + `Text: ${result.text}` + `SpeakerId: ${speakerId}`);

  
      switch (result.reason) {
        case SpeechSDK.ResultReason.NoMatch:
            break
        case SpeechSDK.ResultReason.Canceled:  
            break;
        case SpeechSDK.ResultReason.RecognizedSpeech:
        case SpeechSDK.ResultReason.TranslatedSpeech:
        case SpeechSDK.ResultReason.RecognizedIntent:
            if (text && text.trim() !== '') {
              setNoteText(prevText => prevText + `[Speaker ${speakerId}]: ${text}` +  '\r\n');
              setCurrentText('');
            }
            break;
      }
           
  }

  function onCanceled(event: SpeechSDK.SpeechRecognitionCanceledEventArgs) {
      console.log('Canceled: ', event.errorDetails);
      console.log(`(cancel) Reason: ` + SpeechSDK.CancellationReason[event.reason]);
  }
   
  function onSessionStarted( event: SpeechSDK.SessionEventArgs) {
      console.log(`Session started. ${event.sessionId}`);
  }

  function onSessionStopped( event: SpeechSDK.SessionEventArgs) {
      console.log(`Session stopped. ${event.sessionId}`);
      
  }


  const startContinuosDictation = async () => {
    
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    const transcriber = await createSpeechTranscriber();
    if (transcriber) {

      transcriber.transcribing = (s, e) =>   onRecognizing(e);
      transcriber.transcribed = (s, e) =>   onRecognized(e);
    
      transcriber.canceled = (s, e) => onCanceled(e);
      transcriber.sessionStarted = (s, e) => onSessionStarted(e);
      transcriber.sessionStopped = (s, e) => onSessionStopped(e);
  
      setTranscriber(transcriber);
      transcriber.startTranscribingAsync();
      setIsTranscribing(true);
      
      setCurrentText('');
      setNoteText('');
      setSoapText('');

    } else {
      console.error('Failed to create recognizer.');
    }
  }

  const stopDictation = () => {
    setIsTranscribing(false);

    if (transcriber) {
      transcriber.stopTranscribingAsync();
      transcriber.close();
      setTranscriber(null);
    }
  };

  const handleMicButtonClick = () => {
    if (isTranscribing) {
      stopDictation();
    } else {
      startContinuosDictation();
    }
  };

  const handleAIGenerate = async () => {
    setSoapText('Generating the note.Please wait...');
    if (noteText === '') {
      console.log('No text to generate SOAP note');
      alert('No text to generate SOAP note');
    
    } else {
      console.log('Generating SOAP note from text');
      let soap_note = await generateSOAPNotes(noteText);
      setSoapText(soap_note);
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
                                onClick={handleAIGenerate}
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
                    value={soapText}
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
