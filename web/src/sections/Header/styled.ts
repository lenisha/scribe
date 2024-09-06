import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const HotKeysButton = styled(Button)(({ theme }) => ({
  height: 'fit-content',
  alignSelf: 'center',
  marginRight: theme.spacing(1),
  borderColor: theme.palette.text.disabled,
  '&:hover': {
    borderColor: theme.palette.text.disabled,
  },
  color: theme.palette.text.disabled,
}));

const NewButton = styled(Button)(({ theme }) => ({
  height: 'fit-content',
  alignSelf: 'center',
  marginRight: theme.spacing(1),
  borderColor: theme.palette.info.main,
  '&:hover': {
    borderColor: theme.palette.info.main,
  },
  color: theme.palette.info.main,
}));

export { HotKeysButton , NewButton};
