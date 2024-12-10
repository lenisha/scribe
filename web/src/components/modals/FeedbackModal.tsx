import { useContext } from 'react';

import { Close } from '@mui/icons-material';
import { Button, Card, Modal, Typography, useMediaQuery } from '@mui/material';
import { blue, grey } from '@mui/material/colors';

import { NoteContext } from '@/context/note-context/NoteContext';
import config from '@/services/config';

import CopyButton from '../Buttons/CopyButton';
import { FlexBox, FullSizeCenteredFlexBox } from '../styled';

interface ConsentModalProps {
  isOpen: boolean;
  toggleModal: () => void;
}

export default function FeedbackModal({ isOpen, toggleModal }: ConsentModalProps) {
  const small = useMediaQuery('(max-width: 493px)');

  const { startTime, endTime, sessionId } = useContext(NoteContext);

  const handleClose = () => {
    toggleModal();
  };

  const start = startTime || new Date();
  const end = endTime || new Date();

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
            <Typography variant="h6">Feedback Form</Typography>
            <Button variant="text" onClick={toggleModal} endIcon={<Close />}>
              Close
            </Button>
          </FlexBox>
          <FlexBox
            flexDirection={'row'}
            width={'100%'}
            paddingInline="1.5rem"
            justifyContent={'flex-start'}
            alignItems={'center'}
            gap={small ? '0' : '1rem'}
            borderBottom={1}
            borderColor={grey[300]}
            sx={{
              backgroundColor: grey[50],
            }}
          >
            <Typography variant="h6" fontSize={'0.8rem'}>
              {small ? 'Copy:' : 'Click to copy:'}
            </Typography>
            <FlexBox
              flexDirection={'row'}
              alignItems={small ? 'flex-start' : 'center'}
              justifyContent={small ? 'flex-start' : 'center'}
              gap={small ? '0rem' : '1rem'}
              fontSize={'0.25rem'}
            >
              <CopyButton copyValue={sessionId} buttonText="Session ID" />
              <CopyButton copyValue={start.toString()} buttonText="Start Time" />
              <CopyButton copyValue={end.toString()} buttonText="End Time" />
            </FlexBox>
          </FlexBox>
          <FlexBox
            flex={'flex'}
            flexDirection={'column'}
            sx={{
              backgroundColor: blue[50] + '80',
            }}
          >
            <iframe
              src={`https://docs.google.com/forms/d/e/${
                config.feedback.formId
              }/viewform?embedded=true&usp=pp_url&entry.667875168=${
                sessionId || ''
              }&entry.32563794=${start}&entry.1618706420=${end}`}
              width="640"
              height="2579"
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
