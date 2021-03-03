import React, { ReactNode } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper, { PaperProps } from '@material-ui/core/Paper';
// import AspectRatioIcon from '@material-ui/icons/AspectRatio';
// import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import './Panel.scss';
// const useStyles = makeStyles({
//   root: {},
// });

type Props = {
  titleComponent: ReactNode | string;
  subTitle?: ReactNode | string | null;
  children: ReactNode;
  actions?: typeof Button[] | null;
  className?: string | null;
  disabled?: boolean;
} & PaperProps;

export default React.forwardRef<any, Props>((props, ref) => {
  // TODO/2021-02-27: Allow collapsible panel, add toggle icons in-place of subTitle.
  // Improve this 'jumpy' pattern later
  const {
    titleComponent: title,
    subTitle,
    children,
    actions,
    className,
    disabled,
  } = props;

  return (
    <Paper
      elevation={disabled ? 0 : 4}
      className={`${className || ''} panel-component`}
      ref={ref}
      aria-disabled={Boolean(disabled)}
    >
      <Card>
        <CardContent>
          <div className="panel-header">
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            {subTitle && (
              <Typography variant="body2" color="textSecondary" component="p">
                {subTitle}
              </Typography>
            )}
          </div>
          <div className="panel-body">{children}</div>
        </CardContent>
        {actions && (
          <CardActions>
            {actions.map((ButtonComponent, index) => (
              <ButtonComponent key={index} />
            ))}
          </CardActions>
        )}
      </Card>
    </Paper>
  );
});
