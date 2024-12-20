import { Link } from 'react-router-dom';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function Settings() {
  return (
    <>
      <Meta title="page 4" />
      <FullSizeCenteredFlexBox flexDirection="column">
        <Typography variant="h3">Settings</Typography>
        <Button
          to={`/${Math.random().toString()}`}
          component={Link}
          variant="outlined"
          sx={{ mt: 4 }}
          size="small"
          color="warning"
        >
          Want to check 404?
        </Button>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Settings;
