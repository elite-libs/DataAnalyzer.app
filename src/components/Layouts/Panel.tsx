import React, { ReactNode } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper, { PaperProps } from '@material-ui/core/Paper';

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
} & PaperProps;

export default React.forwardRef<any, Props>((props, ref) => {
  const { titleComponent: title, subTitle, children, actions, className } = props;
  return (
    <Paper elevation={2} className={`${className || ''} panel-component`} ref={ref}>
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
            {actions.map((ButtonComponent) => (
              <ButtonComponent />
            ))}
          </CardActions>
        )}
      </Card>
    </Paper>
  );
});
