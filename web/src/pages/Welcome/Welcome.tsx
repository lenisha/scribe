import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useOrientation from '@/hooks/useOrientation';

function Welcome() {
  const isPortrait = useOrientation();

  return (
    <>
      <Meta title="Welcome" />
      <FullSizeCenteredFlexBox flexDirection={isPortrait ? 'column' : 'row'}>
        <Typography variant="h3">Welcome</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Welcome;
