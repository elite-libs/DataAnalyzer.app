import React from 'react';
import { withStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f5',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(14),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

type Props = {
  tooltipContent?: React.ReactNode | null;
  // variant: 'default' | 'warning';
  children: any | any[] | null;
  className?: string;
};

export default function TooltipWrapper({
  tooltipContent,
  className = '',
  children,
}: Props) {
  if (!tooltipContent) {
    return <>{children}</>;
  }
  return (
    <HtmlTooltip className={className} title={tooltipContent!}>
      {children}
    </HtmlTooltip>
  );
}
