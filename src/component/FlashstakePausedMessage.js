import React, { useEffect } from "react";
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

export default function FlashstakePausedMessage(props) {
  const classes = useStyles();
  let name;
  switch (props.history.location.pathname) {
    case "/stake":
      name = "STAKING";
      break;
    case "/swap":
      name = "SWAPPING";
      break;
    case "/pool":
      name = "POOLING";
      break;
    case "/vote":
      name = "VOTING";
      break;
    default:
      break;
  }
  return (
    <Box px={2} py={5} className={classes.mainContainer}>
      <Block className={classes.icon} />
      <Typography variant="h6" className={classes.messageHeading}>
        {name} UNAVAILABLE
      </Typography>
      <Typography variant="body2" className={classes.message}>
        {name} IS UNAVAILABLE AT THE MOMENT
      </Typography>
    </Box>
  );
}
