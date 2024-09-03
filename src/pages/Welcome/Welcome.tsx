import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import useOrientation from '@/hooks/useOrientation';

import muiLogo from './logos/mui.svg';
import pwaLogo from './logos/pwa.svg';
import reactLogo from './logos/react_ed.svg';
import recoilLogo from './logos/recoil.svg';
import rrLogo from './logos/rr.svg';
import tsLogo from './logos/ts.svg';
import viteLogo from './logos/vite.svg';
import { Image } from './styled';
import Typography from '@mui/material/Typography';

function Welcome() {
  const isPortrait = useOrientation();

  const width = isPortrait ? '40%' : '30%';
  const height = isPortrait ? '30%' : '40%';

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
