import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox, HalfSizeCenteredFlexBox} from '@/components/styled';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { TextField, Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import { FlexBox } from '@/components/styled';
import { useState } from 'react';

function NewNote() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [noteText, setNoteText] = useState('');

  const startDictation = () => {
    setIsTranscribing(true);
  }

  const stopDictation = () => {

    setIsTranscribing(false);
  };


  const handleMicButtonClick = () => {
    if (isTranscribing) {
      stopDictation();
    } else {
      startDictation();
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
                    sx={{ height: '100%' , overflow: 'auto'  }}
                  />
                 </CardContent>
                <CardActions disableSpacing>
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
                 
                </CardActions>
                </Card> 
              
              <Button variant="contained" color="primary" sx={{ alignSelf: 'center' }}>
                Generate
              </Button>
            
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
