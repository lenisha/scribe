import Typography from '@mui/material/Typography';
import Meta from '@/components/Meta';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { TextField, Button, Box, Snackbar } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FlexBox } from '@/components/styled';
import { useState, useEffect } from 'react';
import { createSpeechTranscriber,enumerateMicrophones } from './speech_utils'
import { generateSOAPNotes, formatDate, generateHandout } from './prompt_utils';

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { Language } from '@mui/icons-material';


function NewNote() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingHandout, setIsGeneratingHandout] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [soapText, setSoapText] = useState('');
  const [handoutText, setHandoutText] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [transcriber, setTranscriber] = useState<SpeechSDK.ConversationTranscriber | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-CA');
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [microphones, setMicrophones] = useState<{ label: string, deviceId: string }[]>([]);

  useEffect(() => {
    const browserLanguage = navigator.language;
    console.log("Browser Language: ", browserLanguage);
    if (browserLanguage === 'fr-CA') {
      setSelectedLanguage('fr-CA');
    } else {
      setSelectedLanguage('en-CA');
    }
  }, []);

  useEffect(() => {
    const fetchMicrophones = async () => {
      const mics = await enumerateMicrophones();
      setMicrophones(mics);
    };

    fetchMicrophones();
  }, []);

  const defaultLanguages = ['en-CA',  'fr-CA'];

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
    
    console.log(`Starting continuous dictation ${selectedMic} ${selectedLanguage}`);
    // Create the SpeechRecognizer and set up common event handlers and PhraseList data
    const transcriber = await createSpeechTranscriber(selectedLanguage, selectedMic);
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
      setStartTime(new Date()); // Set start time

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
      setEndTime(new Date()); // Set end time
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
    
    if (noteText === '') {
      console.log('No text to generate SOAP note');
      alert('No text to generate SOAP note');
    
    } else {

      setIsGenerating(true);
      console.log('Generating SOAP note from text');
      
      setSoapText('Generating the note.Please wait...');
      let soap_note = await generateSOAPNotes(noteText, selectedLanguage, startTime, endTime);
      setSoapText(soap_note);

      setIsGenerating(false);
    }
  };

  const handleAIHandoutGenerate = async () => {
    
    if (soapText === '') {
      console.log('No SOAP text to generate Handout');
      alert('No text to generate Handout');
    
    } else {

      setIsGeneratingHandout(true);
      console.log('Generating Handout from text');
      
      setHandoutText('Generating the Handout.Please wait...');
      let handout = await generateHandout(noteText, selectedLanguage);
      setHandoutText(handout);

      setIsGeneratingHandout(false);
    }
  };


  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(soapText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset copy success after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handlePrint = () => {
    if (handoutText) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Patient Handout</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              <h1>Patient Handout</h1>
              <p>Regarding: Clinical encounter dated ${formatDate(startTime)} -  ${formatDate(endTime)} </p>
              ${handoutText}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
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
            
             <Card sx={{ width: '40%', height: '100%' }}>
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

                    <FlexBox sx={{ alignItems: 'center', gap:2}}>
                      <Tooltip title={isTranscribing ? "Stop" : "Start"} arrow>
                        <Button variant="contained" 
                                color={isTranscribing ? "warning" : "primary"}
                                startIcon={isTranscribing ?<MicOffIcon/> :<MicIcon />} 
                                onClick={handleMicButtonClick}>
                          {isTranscribing ? "Stop Transcription" : "Start Transcription"}
                        </Button>
                      </Tooltip>
                     
                      <FormControl sx={{ m: 1, minWidth: 80 ,maxWidth: 150}}>
                          <InputLabel id="microphone-select-label">Microphone</InputLabel>
                          <Select
                              labelId="microphone-select-label"
                              id="microphone-select"
                              value={selectedMic}
                              onChange={(event: any) => {
                                setSelectedMic(event.target.value as string);
                              }}
                              size='small'
                              disabled={isTranscribing || isGenerating}
                              autoWidth
                              label="Microphone"
                            >
                              {microphones.map((mic) => (
                                <MenuItem
                                  key={mic.deviceId}
                                  value={mic.deviceId}
                                >
                                  {mic.label || mic.deviceId}
                                </MenuItem>
                              ))}
                            </Select>
                        </FormControl>
                      
                      <FormControl sx={{ m: 1, minWidth: 80 }}>
                          <InputLabel id="demo-simple-select-autowidth-label">Language</InputLabel>
                          <Select
                                value={selectedLanguage}
                                onChange={(event: any) => {
                                    setSelectedLanguage(event.target.value as string);
                                }}
                                size='small'
                                autoWidth
                                disabled={isTranscribing || isGenerating}
                                label="Language">

                              {defaultLanguages.map((lang) => (
                                  <MenuItem
                                    key={lang}
                                    value={lang}
                                  >
                                    {lang}
                                  </MenuItem>
                              ))}
                           
                          </Select>
                        </FormControl>
                      
                    </FlexBox>
                    <Tooltip title="AI Generate SOAP" arrow>
                        <Button variant="contained" 
                                sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                                disabled={isGenerating}
                                color={isGenerating ? "warning" : "primary"}
                                onClick={handleAIGenerate}                      
                                endIcon={<KeyboardArrowRightIcon/>}>
                          AI Generate
                        </Button>
                    </Tooltip>
                </CardActions>
              </Card> 
              
        
            <Card sx={{ width: '30%', height: '100%' }}>
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
                  onChange={(e) => setSoapText(e.target.value)}
                  sx={{ height: '100%', overflow: 'auto' }}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', m: 2 }}>
                <FlexBox sx={{ alignItems: 'center', gap: 2 }}>
                  <Tooltip title="Copy to clipboard" arrow>
                    <Button
                      sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                      variant="contained"
                      color="primary"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyToClipboard}
                    >
                      Copy
                    </Button>
                  </Tooltip>
                </FlexBox>
              </CardActions>

              <Snackbar
                open={copySuccess}
                message="Text copied to clipboard"
                autoHideDuration={2000}
                onClose={() => setCopySuccess(false)}
              />
          </Card>
          
          <Card sx={{ width: '25%', height: '100%' }}>
              <CardContent>
                <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                  Patient Handout
                </Typography>
                <TextField
                  multiline
                  rows={20}
                  variant="outlined"
                  fullWidth
                  value={handoutText}
                  onChange={(e) => setHandoutText(e.target.value)}
                  sx={{ height: '100%', overflow: 'auto' }}
                />
              </CardContent>  
              <CardActions sx={{ m:2 }}>

                <FlexBox sx={{ alignItems: 'center', gap:2}}>
                  <Tooltip title="Generate Handout" arrow>
                          <Button variant="contained" 
                                  sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                                  disabled={isGeneratingHandout}
                                  color={isGeneratingHandout ? "warning" : "primary"}
                                  onClick={handleAIHandoutGenerate}                      
                                  endIcon={<KeyboardArrowRightIcon/>}>
                            Generate Handout
                          </Button>
                    </Tooltip>
                
                </FlexBox>
                <Tooltip title="Print" arrow>
                    <Button variant="contained" 
                            sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                            disabled={isGeneratingHandout}
                            color="primary"
                            onClick={handlePrint}                      
                            startIcon={<PrintIcon />}>
                      Print
                    </Button>
                </Tooltip>
                </CardActions>
          </Card>
        </Box>    
      </Box>
    </>
  );
}

export default NewNote;
