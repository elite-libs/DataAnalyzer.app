import React, { useState, MouseEvent } from 'react';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   typography: {
//     padding: theme.spacing(2),
//   },
// }));

export default function PopoverWrapper({
  buttonLabel = 'Open Menu',
  // @ts-ignore
  children,
} = {}) {
  // const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | Element | ((element: Element) => Element)>(null);

  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // if (triggerClose) handleClose()

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div className="popover-wrapper">
      <Button
        aria-describedby={id}
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        {buttonLabel}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className="popover"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {children instanceof Function
          ? children({ closeMenu: handleClose })
          : children}
      </Popover>
    </div>
  );
}
