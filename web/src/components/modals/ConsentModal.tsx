import { useState } from 'react';

import { Button, Card, Checkbox, FormControlLabel, Modal, Typography } from '@mui/material';

import { FlexBox, FullSizeCenteredFlexBox } from '../styled';

interface ConsentModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  startRecording: () => void;
}

export default function ConsentModal({ isOpen, toggleModal, startRecording }: ConsentModalProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleClose = () => {
    setConsentChecked(false);
    toggleModal();
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <FullSizeCenteredFlexBox
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'row'}
        width={'100%'}
        height={'100%'}
      >
        <Card style={{ padding: '1rem', maxWidth: '30rem' }}>
          <FlexBox flex={'flex'} flexDirection={'column'}>
            <Typography variant="h5" fontWeight="bold" marginTop="1rem" marginBottom="0.25rem">
              Do you have patient consent?
            </Typography>
            <Typography variant="body1" margin={0} marginBottom="1rem">
              Before beginning a transcription, you must confirm that you have the patient&apos;s
              consent.
            </Typography>
            <FlexBox marginBottom="1rem">
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={() => {
                      setConsentChecked(!consentChecked);
                    }}
                  />
                }
                label="I have the patient's consent"
              />
            </FlexBox>
            <FlexBox justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'}>
              <Button
                color="primary"
                variant="outlined"
                sx={{ width: 'fit-content' }}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={!consentChecked}
                onClick={() => {
                  handleClose();
                  startRecording();
                }}
              >
                Start Transcription
              </Button>
            </FlexBox>
          </FlexBox>
        </Card>
      </FullSizeCenteredFlexBox>
    </Modal>
  );
}
