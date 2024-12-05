import { useContext, useState } from 'react';

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PrintIcon from '@mui/icons-material/Print';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { NoteContext } from '@/context/note-context/NoteContext';
import { formatDate, generateHandout } from '@/utils/prompt';

import { FlexBox } from '../styled';

export default function PatientHandout() {
  const small = useMediaQuery('(max-width: 400px)');

  const { selectedLanguage, startTime, endTime, soapText, handoutText, updateHandoutText } =
    useContext(NoteContext);

  const [isGeneratingHandout, setIsGeneratingHandout] = useState(false);

  const handleAIHandoutGenerate = async () => {
    if (!soapText) {
      console.log('No SOAP text to generate Handout');
      alert('No text to generate Handout');
    } else {
      setIsGeneratingHandout(true);
      console.log('Generating Handout from text');

      updateHandoutText('Generating the Handout.Please wait...');
      const handout = await generateHandout(soapText, selectedLanguage);
      updateHandoutText(handout);

      setIsGeneratingHandout(false);
    }
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
              <p>Regarding: Clinical encounter dated ${formatDate(startTime)} -  ${formatDate(
                endTime,
              )} </p>
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
    <FlexBox flexGrow={1} minWidth="fit-content">
      <Card sx={{ paddingBottom: '1rem', width: '100%', minHeight: 'fit-content', height: '100%' }}>
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Patient Handout
          </Typography>
          <TextField
            id="patient-handout"
            name="patient-handout"
            multiline
            rows={20}
            variant="outlined"
            fullWidth
            value={handoutText}
            onChange={(e) => updateHandoutText(e.target.value)}
            sx={{ height: '100%', overflow: 'auto' }}
          />
        </CardContent>
        <CardActions sx={{ m: 2 }}>
          <FlexBox
            width={'100%'}
            flexDirection={small ? 'column' : 'row'}
            justifyContent={small ? 'center' : 'space-between'}
            alignItems={'center'}
            gap="1rem"
          >
            <Tooltip title="Generate Handout" arrow>
              <span style={{ width: small ? '100%' : 'fit-content' }}>
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                  disabled={isGeneratingHandout || !soapText}
                  color={isGeneratingHandout ? 'warning' : 'primary'}
                  onClick={handleAIHandoutGenerate}
                  endIcon={<KeyboardArrowRightIcon />}
                  fullWidth={small}
                >
                  Generate Handout
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Print" arrow>
              <span style={{ width: small ? '100%' : 'fit-content' }}>
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                  disabled={isGeneratingHandout || !handoutText}
                  color="primary"
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  fullWidth={small}
                >
                  Print
                </Button>
              </span>
            </Tooltip>
          </FlexBox>
        </CardActions>
      </Card>
    </FlexBox>
  );
}
