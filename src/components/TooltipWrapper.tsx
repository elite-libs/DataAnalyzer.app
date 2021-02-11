import React from 'react';
import { withStyles, Theme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const HtmlTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f5',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

type Props = {
  tooltipContent?: React.ReactNode | null;
  children: any | any[] | null;
};

export default function TooltipWrapper({ tooltipContent, children }: Props) {
  if (!tooltipContent) {
    return <>{children}</>;
  }
  return <HtmlTooltip title={tooltipContent!}>{children}</HtmlTooltip>;
}
