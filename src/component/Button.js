import React from "react";
import { Button as MuiButton, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  commonStyles: {
    border: "none",
    height: 35,
    letterSpacing: 2,
    lineHeight: 1.2,
    borderRadius: 0,
    transition: "none !important",
  },
  loadingIcon: {
    marginRight: 5,
  },
  darkButton: {
    background: theme.palette.button.dark,
    color: theme.palette.buttonText.dark,
    "&:hover": {
      // background: theme.palette.xioRed.main,
      background: "#434343",
    },
    "&.Mui-disabled": {
      background: theme.palette.button.dark,
      color: theme.palette.buttonText.dark,
    },
  },
  redButton: {
    background: theme.palette.button.red,
    color: theme.palette.buttonText.red,
    "&:hover": {
      // background: theme.palette.xioRed.main,
      background: "#cd545a",
    },
    "&.Mui-disabled": {
      background: theme.palette.border.main,
    },
  },
}));

export default function Button(props) {
  const classes = useStyles();

  return (
    <MuiButton
      {...props}
      variant="outlined"
      className={`${props.className} ${classes.commonStyles} ${
        { dark: classes.darkButton, red: classes.redButton }[props.variant]
      }`}
    >
      {props.loading ? (
        <CircularProgress
          size={12}
          color="inherit"
          className={classes.loadingIcon}
        />
      ) : null}
      {props.children}
    </MuiButton>
  );
}
