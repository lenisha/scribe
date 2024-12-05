import { Link } from 'react-router-dom';

import { Logout } from '@mui/icons-material';
import DefaultIcon from '@mui/icons-material/Deblur';
import { Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import { FlexBox } from '@/components/styled';
import routes from '@/routes';
import useSidebar from '@/store/sidebar';

function Sidebar() {
  const [isSidebarOpen, sidebarActions] = useSidebar();

  return (
    <SwipeableDrawer
      anchor="left"
      open={isSidebarOpen}
      onClose={sidebarActions.close}
      onOpen={sidebarActions.open}
      disableBackdropTransition={false}
      swipeAreaWidth={30}
      data-pw="sidebar"
    >
      <FlexBox flexDirection={'column'} height="100%" alignItems={'center'} width={'15rem'}>
        <Typography variant="h4" fontWeight="bold" marginTop={'1rem'} textAlign={'center'}>
          AI Scribe
        </Typography>
        <FlexBox
          width="100%"
          height="100%"
          paddingBottom="1rem"
          flexDirection={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <List sx={{ width: '100%' }}>
            {Object.values(routes)
              .filter((route) => route.title)
              .map(({ path, title, icon: Icon }) => (
                <ListItem sx={{ p: 0 }} key={path}>
                  <ListItemButton
                    component={Link}
                    to={path as string}
                    onClick={sidebarActions.close}
                  >
                    <ListItemIcon>{Icon ? <Icon /> : <DefaultIcon />}</ListItemIcon>
                    <ListItemText>{title}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <FlexBox width="100%" height="fit-content">
            <ListItemButton sx={{ height: 'fit-content' }}>
              <ListItemIcon>{<Logout />}</ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </ListItemButton>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </SwipeableDrawer>
  );
}

export default Sidebar;
