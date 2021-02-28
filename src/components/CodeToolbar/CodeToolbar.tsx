import React, { MouseEventHandler } from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import TooltipWrapper from 'components/TooltipWrapper';
import type { PropTypes } from '@material-ui/core';

import './CodeToolbar.scss';

export interface IToolbarButton {
  label: string;
  tooltip?: string | React.ReactNode | null;
  onClick: MouseEventHandler;
  color?: PropTypes.Color;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  startIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
type Props = {
  buttons: IToolbarButton[];
  disabled?: boolean;
};
/*
  <ButtonGroup
      variant="contained"
      className={`code-toolbar d-flex align-items-start mt-1 ml-1`}
    >
      <Button
        size="small"
        color="secondary"
        variant={'contained'}
        startIcon={<SyncOutlinedIcon />}
        onClick={resetAppState}
        style={{}}
      >
        <TooltipWrapper tooltipContent={<b>Generate a different output!</b>}>
          <div>Reset</div>
        </TooltipWrapper>
      </Button>
      <Button
        size="small"
        variant="contained"
        color="primary"
        title="Copy source"
        onClick={handleCopyClick}
        startIcon={<FileCopy />}
      >
        <TooltipWrapper tooltipContent={<b>Copy to clipboard</b>}>
          <div>Copy</div>
        </TooltipWrapper>
      </Button>
    </ButtonGroup>
 */

export default function CodeToolbar({ buttons, disabled }: Props) {
  return (
    <ButtonGroup
      disabled={disabled}
      variant="contained"
      className={`code-toolbar d-flex align-items-start mt-1 ml-1`}
    >
      {buttons.map(({ label, tooltip, ...buttonProps }) => {
        if (disabled) {
          buttonProps.color = 'inherit';
          buttonProps.disabled = disabled;
        }
        return (
          <Button
            key={label}
            size="small"
            color="secondary"
            variant={'contained'}
            aria-label={label}
            {...buttonProps}
          >
            <TooltipWrapper tooltipContent={tooltip}>
              <div>{label}</div>
            </TooltipWrapper>
          </Button>
        );
      })}
    </ButtonGroup>
  );
}
