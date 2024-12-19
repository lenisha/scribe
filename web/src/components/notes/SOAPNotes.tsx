import { useContext, useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { NoteContext } from '@/context/note-context/NoteContext';

import { FlexBox } from '../styled';

export default function SOAPNotes() {
  const medium = useMediaQuery('(max-width: 600px)');

  const { soapText, updateSoapText } = useContext(NoteContext);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(soapText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset copy success after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <FlexBox flexGrow={1} minWidth={medium ? 'fit-content' : '25rem'}>
      <Card sx={{ paddingBottom: '1rem', width: '100%', minHeight: 'fit-content', height: '100%' }}>
        <CardContent>
          <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
            Clinical Note
          </Typography>
          <TextField
            id="soap-notes"
            name="soap-notes"
            multiline
            rows={20}
            variant="outlined"
            fullWidth
            value={soapText}
            onChange={(e) => updateSoapText(e.target.value)}
            sx={{ height: '100%', overflow: 'auto' }}
          />
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', m: 2 }}>
          <FlexBox sx={{ alignItems: 'center', gap: 2 }}>
            <Tooltip title="Copy to clipboard" arrow>
              <span>
                <Button
                  disabled={!soapText}
                  sx={{ alignSelf: 'center', marginLeft: 'auto' }}
                  variant="contained"
                  color="primary"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyToClipboard}
                >
                  Copy
                </Button>
              </span>
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
    </FlexBox>
  );
}
