import { useNavigate } from 'react-router-dom';

import AddTaskIcon from '@mui/icons-material/AddTask';
import ThemeIcon from '@mui/icons-material/InvertColors';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';

import { FlexBox } from '@/components/styled';
import useHotKeysDialog from '@/store/hotkeys';
//import useNotifications from '@/store/notifications';
import useSidebar from '@/store/sidebar';
import useTheme from '@/store/theme';
//import { getRandomJoke } from './utils';
import { OS, getOS } from '@/utils/device-info';

import { HotKeysButton, NewButton } from './styled';

function Header() {
  const [, sidebarActions] = useSidebar();
  const [theme, themeActions] = useTheme();
  //const [, notificationsActions] = useNotifications();
  const [, hotKeysDialogActions] = useHotKeysDialog();
  const navigate = useNavigate();

  // TODO: Remove or uncomment. Keeping for reference
  // function showNotification() {
  //   notificationsActions.push({
  //     options: {
  //       // Show fully customized notification
  //       // Usually, to show a notification, you'll use something like this:
  //       // notificationsActions.push({ message: ... })
  //       // `message` accepts string as well as ReactNode
  //       // If you want to show a fully customized notification, you can define
  //       // your own `variant`s, see @/sections/Notifications/Notifications.tsx
  //       variant: 'customNotification',
  //     },
  //     message: getRandomJoke(),
  //   });
  // }

  return (
    <Box sx={{ flexGrow: 1 }} data-pw={`theme-${theme}`}>
      <AppBar color="transparent" elevation={1} position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <FlexBox sx={{ alignItems: 'center' }}>
            <IconButton
              onClick={sidebarActions.toggle}
              size="large"
              edge="start"
              color="info"
              aria-label="menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Tooltip title="New Note" arrow>
              <NewButton
                size="small"
                variant="outlined"
                color="info"
                aria-label="new"
                startIcon={<AddTaskIcon />}
                onClick={() => navigate('/new-note')}
              >
                New Note
              </NewButton>
            </Tooltip>
          </FlexBox>

          <FlexBox>
            <FlexBox>
              <Tooltip title="Hot keys" arrow>
                <HotKeysButton
                  size="small"
                  variant="outlined"
                  aria-label="open hotkeys dialog"
                  onClick={hotKeysDialogActions.open}
                >
                  {getOS() === OS.MAC ? '⌥' : 'alt'} + k
                </HotKeysButton>
              </Tooltip>
            </FlexBox>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Switch theme" arrow>
              <IconButton
                color="info"
                edge="end"
                size="large"
                onClick={themeActions.toggle}
                data-pw="theme-toggle"
              >
                <ThemeIcon />
              </IconButton>
            </Tooltip>
          </FlexBox>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;
