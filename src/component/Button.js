import React from "react";
import { Button as MuiButton, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  commonStyles: {
    border: "none",
    height: 35,
    letterSpacing: 2,
    lineHeight: 1.2,
    borderRadius: 10,

    transition: "none !important",
    "&.MuiButton-label": {
      ...theme.typography.body1,
    },
    fontWeight: 700,
  },
  body1: {
    "&.MuiButton-label": {
      ...theme.typography.body1,
    },
  },
  body2: {
    "&.MuiButton-label": {
      ...theme.typography.body2,
    },
  },
  overline: {
    "&.MuiButton-label": {
      ...theme.typography.overline,
    },
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
      background: "#e2874a",
    },
    "&.Mui-disabled": {
      background: theme.palette.border.main,
    },
  },
  disable: {
    background: theme.palette.border.main,
    color: theme.palette.buttonText.red,
    "&:hover": {
      // background: theme.palette.xioRed.main,
      background: theme.palette.border.main,
    },
    "&.Mui-disabled": {
      background: theme.palette.border.main,
    },
  },
  retroButton: {
    border: `2px solid ${theme.palette.shadowColor.main}`,
    boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.main}`,
    background: theme.palette.button.retro,
    color: "#fff",
    "&:hover": {
      // background: theme.palette.xioRed.main,
      background: "#c562d6",
    },
    "&.Mui-disabled": {
      background: theme.palette.border.main,
    },
  },
}));

export default function Button({
  fontSizeLocal,
  loading,
  isDisabled,
  ...props
}) {
  const classes = useStyles();
  return (
    <MuiButton
      {...props}
      variant="outlined"
      className={`${props.className} ${classes.commonStyles} ${
        {
          dark: classes.darkButton,
          retro: classes.retroButton,
          red: classes.redButton,
          disable: classes.disable,
        }[props.variant]
      } ${fontSizeLocal ? classes[fontSizeLocal] : ""}`}
    >
      {loading ? (
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
