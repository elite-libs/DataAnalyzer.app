import React, { ReactNode } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
// import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// const useStyles = makeStyles({
//   root: {},
// });

type Props = {
  title: ReactNode | string;
  subTitle?: ReactNode | string | null;
  children: ReactNode;
  actions?: typeof Button[] | null;
  className?: string | null;
};

export default function Panel({ title, subTitle, children, actions, className }: Props) {
  // const classes = useStyles();

  return (
    <Paper elevation={2} className={`${className || ''} panel-component`}>
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
}
