import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

interface Props<T> {
  buttonTextOverride?: string | null;
  options: Array<T | string>;
  onSelect: (value: T | unknown | any, index?: number) => void | null | any;
  className?: string;
}

export default function DropdownMenu<T>({
  buttonTextOverride,
  options,
  onSelect = (value: any, index: any) => {},
  className = 'demo-menu',
}: Props<T>) {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const anchorRef = React.useRef<HTMLAnchorElement>(null);

  const handleClick = (index: number) => {
    if (onSelect) {
      return onSelect(options[selectedIndex], selectedIndex);
    }
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
    handleClick(index);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: { target: any }) => {
    if (
      anchorRef &&
      anchorRef!.current &&
      anchorRef.current!.contains!(event.target)
    ) {
      return;
    }
    setOpen(false);
  };

  if (!options || options.length === 0)
    options = ['[Warn] No options provided.'];

  return (
    <>
      <ButtonGroup
        variant="outlined"
        color="secondary"
        ref={anchorRef}
        aria-label="split button"
        className={className }
        component={'a'}
      >
        <Button onClick={handleToggle}>
          {buttonTextOverride || options[selectedIndex]}
        </Button>
        <Button
          color="primary"
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList className="demo-menu" id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      key={index}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
