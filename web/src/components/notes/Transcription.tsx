import { useContext, useState } from 'react';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { NoteContext } from '@/context/note-context/NoteContext';
import { SupportedLanguages } from '@/context/note-context/types';
import useDictation from '@/hooks/useDictation';
import { generateSOAPNotes } from '@/utils/prompt';

import ConsentModal from '../modals/ConsentModal';
import { FlexBox } from '../styled';

export default function DictatedNotes() {
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const small = useMediaQuery('(max-width: 460px)');
  const xs = useMediaQuery('(max-width: 400px)');

  const {
    selectedLanguage,
    startTime,
    endTime,
    noteText,
    updateNoteText,
    updateSoapText,
    updateSelectedLanguage,
  } = useContext(NoteContext);

  const {
    currentText,
    microphones,
    selectedMic,
    isTranscribing,
    startContinuousDictation,
    stopDictation,
    updateSelectedMic,
    getMicrophones,
  } = useDictation();

  const defaultLanguages = Object.values(SupportedLanguages);

  const toggleConsentModal = () => {
    setConsentModalOpen(!consentModalOpen);
  };

  const handleMicButtonClick = () => {
    if (isTranscribing) {
      stopDictation();
    } else {
      toggleConsentModal();
    }
  };

  const handleAIGenerate = async () => {
    if (noteText === '') {
      console.log('No text to generate SOAP note');
      alert('No text to generate SOAP note');
    } else {
      setIsGenerating(true);
      console.log('Generating SOAP note from text');

      updateSoapText('Generating the note. Please wait...');
      const soap_note = await generateSOAPNotes(noteText, selectedLanguage, startTime, endTime);
      updateSoapText(soap_note);

      setIsGenerating(false);
    }
  };

  return (
    <>
      <ConsentModal
        isOpen={consentModalOpen}
        toggleModal={toggleConsentModal}
        startRecording={startContinuousDictation}
      />
      <FlexBox flexGrow={1} minWidth="fit-content">
        <Card
          sx={{ paddingBottom: '1rem', width: '100%', minHeight: 'fit-content', height: '100%' }}
        >
          <CardContent>
            <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
              Transcription
            </Typography>
            <TextField
              id="dictated-notes"
              name="dictated-notes"
              multiline
              rows={20}
              variant="outlined"
              fullWidth
              value={noteText + currentText}
              onChange={(e) => updateNoteText(e.target.value)}
              sx={{ height: '100%', overflow: 'auto' }}
            />
          </CardContent>

          <CardActions sx={{ paddingInline: '1rem', width: '100%' }}>
            <FlexBox width="100%" flexDirection="column" gap="1rem" padding={0}>
              <FlexBox gap="1rem" flexDirection={small ? 'column' : 'row'}>
                <FormControl
                  size="small"
                  sx={{
                    minWidth: small ? '2rem' : '9rem',
                    width: small ? '100%' : 'fit-content',
                    maxWidth: small ? '100%' : '15rem',
                  }}
                >
                  <InputLabel id="microphone-select-label">Microphone</InputLabel>
                  <Select
                    labelId="microphone-select-label"
                    id="microphone-select"
                    value={selectedMic}
                    onChange={(event) => {
                      if (microphones.length === 0) {
                        return;
                      }
                      updateSelectedMic(event.target.value);
                    }}
                    onOpen={() => {
                      getMicrophones();
                    }}
                    size="small"
                    disabled={isTranscribing || isGenerating}
                    label="Microphone"
                    fullWidth={small}
                  >
                    {microphones.length > 0 &&
                      microphones.map((mic) => (
                        <MenuItem sx={{ width: '100%' }} key={mic.deviceId} value={mic.deviceId}>
                          <Typography width={xs ? '14rem' : '100%'} noWrap overflow="ellipsis">
                            {mic.label || mic.deviceId}
                          </Typography>
                        </MenuItem>
                      ))}
                    {microphones.length <= 0 && (
                      <Tooltip title="Have you allowed permission?">
                        <span>
                          <MenuItem disabled key="no-mic" value="">
                            <Typography fontStyle="italic">No microphones found.</Typography>
                          </MenuItem>
                        </span>
                      </Tooltip>
                    )}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="language-select-label">Language</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(event) => {
                      updateSelectedLanguage(event.target.value as SupportedLanguages);
                    }}
                    size="small"
                    fullWidth={small}
                    disabled={isTranscribing || isGenerating}
                    label="Language"
                  >
                    {defaultLanguages.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FlexBox>

              <FlexBox
                flexDirection={small ? 'column' : 'row'}
                justifyContent={small ? 'center' : 'space-between'}
                alignItems="center"
                gap="1rem"
                width={'100%'}
              >
                <Tooltip
                  title={!selectedMic ? 'Select a microphone' : isTranscribing ? 'Stop' : 'Start'}
                  arrow
                >
                  <span style={{ width: small ? '100%' : 'fit-content' }}>
                    <Button
                      variant="contained"
                      color={isTranscribing ? 'warning' : 'primary'}
                      startIcon={isTranscribing ? <MicOffIcon /> : <MicIcon />}
                      onClick={handleMicButtonClick}
                      fullWidth={small}
                      disabled={selectedMic ? false : true}
                    >
                      {isTranscribing ? 'Stop Listening' : 'Start Listening'}
                    </Button>
                  </span>
                </Tooltip>
                <Tooltip title="AI Generate SOAP" arrow>
                  <span style={{ width: small ? '100%' : 'fit-content' }}>
                    <Button
                      variant="contained"
                      disabled={isGenerating || !noteText.trim()}
                      color={isGenerating ? 'warning' : 'primary'}
                      onClick={handleAIGenerate}
                      endIcon={<KeyboardArrowRightIcon />}
                      fullWidth={small}
                    >
                      AI Generate
                    </Button>
                  </span>
                </Tooltip>
              </FlexBox>
            </FlexBox>
          </CardActions>
        </Card>
      </FlexBox>
    </>
  );
}
