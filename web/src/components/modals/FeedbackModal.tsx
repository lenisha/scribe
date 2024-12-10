import { Close } from '@mui/icons-material';
import { Button, Card, Modal, Typography, useMediaQuery } from '@mui/material';
import { grey } from '@mui/material/colors';

import config from '@/services/config';

import { FlexBox, FullSizeCenteredFlexBox } from '../styled';

interface ConsentModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  sessionId: string;
}

export default function FeedbackModal({ isOpen, toggleModal, sessionId }: ConsentModalProps) {
  const small = useMediaQuery('(max-width: 625px)');

  const handleClose = () => {
    toggleModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleClose();
      }}
    >
      <FullSizeCenteredFlexBox
        justifyContent={'center'}
        alignItems={'center'}
        flexDirection={'row'}
        width={'100%'}
        height={'100%'}
      >
        <Card
          sx={{
            margin: '2rem',
            minWidth: 'fit-content',
            width: '100%',
            maxWidth: '50rem',
            height: 'fit-content%',
          }}
        >
          <FlexBox
            flexDirection={'row'}
            width={'100%'}
            paddingInline="1.5rem"
            paddingBlock={'0.5rem'}
            justifyContent={'space-between'}
            alignItems={'center'}
            borderBottom={1}
            borderColor={grey[300]}
          >
            <FlexBox
              flexDirection={small ? 'column' : 'row'}
              alignItems={small ? 'flex-start' : 'center'}
              justifyContent={small ? 'flex-start' : 'center'}
              gap={small ? '0.25rem' : '1rem'}
            >
              <Typography variant="h6">Feedback Form</Typography>
              <Typography variant="body1">Session ID: {sessionId}</Typography>
            </FlexBox>
            <Button variant="text" onClick={toggleModal} endIcon={<Close />}>
              Close
            </Button>
          </FlexBox>
          <FlexBox flex={'flex'} flexDirection={'column'}>
            <iframe
              src={`https://docs.google.com/forms/d/e/${config.feedback.formId}/viewform?embedded=true&usp=pp_url&entry.503004240=${sessionId}`}
              width="640"
              height="2178"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '100%',
                maxWidth: '100%',
                minHeight: '100%',
                maxHeight: '40rem',
                border: 'none',
              }}
            >
              <Typography variant="body1" color={'black'} fontStyle={'italic'}>
                Loading…
              </Typography>
            </iframe>
          </FlexBox>
        </Card>
      </FullSizeCenteredFlexBox>
    </Modal>
  );
}
