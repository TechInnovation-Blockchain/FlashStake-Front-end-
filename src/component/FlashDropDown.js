import React, { useEffect, Fragment, useState, useCallback } from "react";
import {
  Dialog as MuiDialog,
  IconButton,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import flash from "../assets/FlashLogo.png";
import Flash from "../assets/Tokens/FLASH.png";
import { connect } from "react-redux";

const useStyles = makeStyles((theme, _theme) => ({
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    cursor: "Pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    background: theme.palette.background.secondary2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: _theme === "retro" ? 7 : 9,
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
  },

  retroDropdown: {
    background: theme.palette.background.secondary2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
  },

  dropdownIcon: {
    color: theme.palette.xioRed.main,
    position: "absolute",
    right: 0,
    // margin: theme.spacing(1),
    fontWeight: 900,
  },
  closeBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  backIcon: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.xioRed.main,
  },
  clearSearch: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.disabled,
  },
  dialogPaper: {
    maxWidth: 400,
    width: "100vw",
    borderRadius: 0,
  },
  dialog: {
    textAlign: "center",
    padding: theme.spacing(2),
    paddingBottom: 0,

    "&>*": {
      marginBottom: theme.spacing(2),
    },
    background: theme.palette.background.primary,
  },
  dialogHeading: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      // fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  list: {
    maxHeight: "100%",
    overflowY: "scroll",
    padding: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    filter: "grayscale(1)",

    "&:hover": {
      filter: "none",
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.secondary3,
    },

    // "&:hover": {
    //   color: theme.palette.text.primary,
    // },
  },
  listItemText: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },
  disabledText: {
    // color: theme.palette.xioRed.main,
    color: theme.palette.text.disabled,
    // fontSize: 12,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
  },
  loadingIcon: {
    marginRight: 5,
  },
  tokensListBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  DefaultListBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultListText: {
    paddingLeft: theme.spacing(1),
  },
  // tokensLogo: {
  //   filter: "grayscale(1)",

  //   "&:hover": {
  //     filter: "none",
  //   },
  // },
}));

function FlashDropDown({ theme }) {
  const classes = useStyles();

  return (
    <Fragment>
      <Box className={classes.dropdown}>
        <Typography variant="body1" className={classes.primaryText}>
          <Fragment>
            <img
              src={theme === "retro" ? Flash : flash}
              alt="Logo"
              srcSet=""
              width={15}
              style={{ marginRight: 5 }}
            />
          </Fragment>

          <span className={classes.disabledText}>FLASH</span>
        </Typography>
      </Box>
    </Fragment>
  );
}

const mapStateToProps = ({ ui: { theme } }) => ({
  theme,
});

export default connect(mapStateToProps, {})(FlashDropDown);
