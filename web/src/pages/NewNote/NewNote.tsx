import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import ClinicalNote from '@/components/notes/ClinicalNote';
import PatientHandout from '@/components/notes/PatientHandout';
import Transcription from '@/components/notes/Transcription';
import { FlexBox } from '@/components/styled';
import NoteContextProvider from '@/context/note-context/NoteContext';

function NewNote() {
  return (
    <>
      <Meta title="New Note" />
      <FlexBox flexDirection="column" justifyContent="center" width="100%" height="fit-content">
        <Typography variant="h5" fontWeight="medium" marginBlock="1rem" textAlign={'center'}>
          AI Scribe Note
        </Typography>
        <FlexBox
          flexDirection="row"
          flexWrap="wrap"
          paddingInline="1rem"
          gap="1rem"
          height="100%"
          width="100%"
        >
          <NoteContextProvider defaultLanguage={navigator.language}>
            <Transcription />
            <ClinicalNote />
            <PatientHandout />
          </NoteContextProvider>
        </FlexBox>
      </FlexBox>
    </>
  );
}

export default NewNote;
