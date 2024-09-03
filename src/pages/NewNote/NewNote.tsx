import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function NewNote() {
  return (
    <>
      <Meta title="New Note" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">New Note</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default NewNote;
