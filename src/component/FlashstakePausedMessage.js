import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Block } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    color: theme.palette.xioRed.main,
  },
  icon: {
    fontSize: 48,
  },
  messageHeading: {
    margin: theme.spacing(1, 0),
    fontWeight: 700,
  },
}));

export default function FlashstakePausedMessage() {
  const classes = useStyles();
  return (
    <Box px={2} py={5} className={classes.mainContainer}>
      <Block className={classes.icon} />
      <Typography variant="h6" className={classes.messageHeading}>
        FLASHSTAKING UNAVAILABLE
      </Typography>
      <Typography variant="body2" className={classes.message}>
        FLASHSTAKING IS UNAVAILABLE AT THE MOMENT, YOU CAN STILL WITHDRAW YOUR
        FUNDS FROM THE DASHBOARD
      </Typography>
    </Box>
  );
}
