import { useState } from 'react';

import { Button, Tooltip } from '@mui/material';

interface CopyButtonProps {
  copyValue: string;
  buttonText: string;
}

enum ClipboardStatus {
  DEFAULT = 'Copy to Clipboard',
  COPIED = 'Copied!',
}

export default function CopyButton({ copyValue, buttonText }: CopyButtonProps) {
  const [tooltip, setTooltip] = useState(ClipboardStatus.DEFAULT);

  const handleClick = () => {
    navigator.clipboard.writeText(copyValue);

    setTooltip(() => ClipboardStatus.COPIED);

    setTimeout(() => {
      setTooltip(() => ClipboardStatus.DEFAULT);
    }, 1000);
  };

  return (
    <Tooltip title={tooltip}>
      <Button variant="text" onClick={handleClick} sx={{ fontSize: '0.8rem' }}>
        {buttonText}
      </Button>
    </Tooltip>
  );
}
