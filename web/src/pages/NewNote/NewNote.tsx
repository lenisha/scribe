import { useState } from 'react';

import { Button, useMediaQuery } from '@mui/material';
import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import FeedbackModal from '@/components/modals/FeedbackModal';
import DictatedNotes from '@/components/notes/DictatedNotes';
import PatientHandout from '@/components/notes/PatientHandout';
import SOAPNotes from '@/components/notes/SOAPNotes';
import { FlexBox } from '@/components/styled';
import NoteContextProvider from '@/context/note-context/NoteContext';

function NewNote() {
  const small = useMediaQuery('(max-width: 500px)');
  const [feebackModalOpen, setFeedbackModalOpen] = useState(false);

  const toggleFeedbackModal = () => {
    setFeedbackModalOpen(!feebackModalOpen);
  };

  return (
    <>
      <FeedbackModal
        isOpen={feebackModalOpen}
        toggleModal={toggleFeedbackModal}
        sessionId="qwertyuiop1234567890"
      />
      <Meta title="New Note" />
      <FlexBox flexDirection="column" justifyContent="center" width="100%" height="fit-content">
        <FlexBox
          position={'relative'}
          flexDirection={small ? 'column' : 'row'}
          justifyContent={'center'}
          alignItems={'center'}
          marginBlock={'1rem'}
          marginInline={'1rem'}
        >
          <Typography variant="h5" fontWeight="medium" marginBottom={0} textAlign={'center'}>
            Dictate New Note
          </Typography>

          <Button
            variant="text"
            onClick={toggleFeedbackModal}
            sx={{ position: small ? '' : 'absolute', right: small ? '' : 0 }}
          >
            Give Feedback
          </Button>
        </FlexBox>
        <FlexBox
          flexDirection="row"
          flexWrap="wrap"
          paddingInline="1rem"
          gap="1rem"
          height="100%"
          width="100%"
        >
          <NoteContextProvider defaultLanguage={navigator.language}>
            <DictatedNotes />
            <SOAPNotes />
            <PatientHandout />
          </NoteContextProvider>
        </FlexBox>
      </FlexBox>
    </>
  );
}

export default NewNote;
