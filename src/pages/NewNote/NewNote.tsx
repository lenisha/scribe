import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox, HalfSizeCenteredFlexBox} from '@/components/styled';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { TextField, Button, Box } from '@mui/material';

import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import { Label } from '@mui/icons-material';

function NewNote() {
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
