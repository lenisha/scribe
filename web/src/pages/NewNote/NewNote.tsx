import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import DictatedNotes from '@/components/notes/DictatedNotes';
import PatientHandout from '@/components/notes/PatientHandout';
import SOAPNotes from '@/components/notes/SOAPNotes';
import { FlexBox } from '@/components/styled';
import NoteContextProvider from '@/context/note-context/NoteContext';

function NewNote() {
  return (
    <>
      <Meta title="New Note" />
      <FlexBox flexDirection="column" justifyContent="center" width="100%" height="fit-content">
        <Typography variant="h5" fontWeight="medium" marginBlock="1rem" textAlign={'center'}>
          Dictate New Note
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
