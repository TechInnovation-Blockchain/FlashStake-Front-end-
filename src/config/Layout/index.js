import React, { Fragment, createRef, useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Container,
  Box,
  Backdrop,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { WalletConnect, Snackbar } from "../../component";
import Routes from "../Routes";
// import { setReset } from "../../redux/actions/flashstakeActions";
import xordLogo from "../../assets/xord-logo.png";
import "../../assets/css/main.css";

import {
  showWalletBackdrop,
  themeSwitchAction,
} from "../../redux/actions/uiActions";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    // padding: theme.spacing(4, 0),
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    // backgroundColor: theme.palette.background.secondary2,
    maxWidth: "450px",
    transition: "all 0.5s ease",
    padding: theme.spacing(7, 1),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 1),
    },
  },
  contentContainer: {
    backgroundColor: theme.palette.background.secondary,
    overflow: "hidden",
    borderRadius: "10px",
    border: `1px solid ${theme.palette.border.secondary}`,
    width: "100%",
  },
  backdrop: {
    zIndex: 1,
    backgroundColor: theme.palette.background.primary,
  },
  backdrop2: {
    zIndex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  backdropThemeSwitch: {
    zIndex: 1,
    backgroundColor: theme.palette.background.primary,
  },
  backdropContentContainer: {
    color: theme.palette.xioRed.main,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing(2),
    fontWeight: 700,
  },
  poweredContentContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    position: "fixed",
    left: "50%",
    bottom: 15,
    transform: "translateX(-50%)",
    textDecoration: "none",
  },
  poweredText: {
    marginBottom: theme.spacing(0.5),
    color: theme.palette.text.disabled,
    fontWeight: 700,
  },
  logo: {
    cursor: "pointer",
    // background: "#0e0e0e",
    // borderRadius: "50%",
  },
  expandableBox: {
    width: 250,
    backgroundColor: "#555555",

    marginBottom: 1,
  },
  textColor: {
    color: "#fff",
  },
  btn: {
    maxWidth: "250px",
  },
  btn2: {},
}));

export let walletBtnRef = createRef();

function Layout({
  dapp,
  themeSwitch,
  // setReset,
  showWalletBackdrop,
  walletBackdrop,
  themeMode,
  toggleThemeMode,
  themeSwitchAction,
}) {
  const classes = useStyles();

  const handleClose = () => {
    showWalletBackdrop(false);
  };

  useEffect(() => {
    const body = document.querySelector("#body");
    // body.style.backgroundColor = "#171717";

    themeMode === "dark"
      ? (body.style.backgroundColor = "#000000")
      : (body.style.backgroundColor = "#f5f5f5");
  }, [themeMode]);

  return (
    <Fragment>
      <Container maxWidth="sm" className={classes.mainContainer}>
        <Box className={`transitionEase ${classes.contentContainer}`}>
          <Routes themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
        </Box>

        <Backdrop
          className={classes.backdrop2}
          open={walletBackdrop}
          onClick={handleClose}
        ></Backdrop>
        <WalletConnect />
        <Snackbar />
      </Container>
      <Backdrop className={classes.backdropThemeSwitch} open={themeSwitch}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <Backdrop className={classes.backdrop} open={dapp}>
        <Box className={classes.backdropContentContainer}>
          <CircularProgress color="inherit" />
          <Typography variant="body1" className={classes.loadingText}>
            LOADING
          </Typography>
        </Box>
        <a
          className={classes.poweredContentContainer}
          href="https://xord.one"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Typography variant="body2" className={classes.poweredText}>
            POWERED BY
          </Typography>
          <img src={xordLogo} alt="xord.one" width={70} />
        </a>
      </Backdrop>
      <div ref={walletBtnRef}></div>
    </Fragment>
  );
}

const mapStateToProps = ({
  ui: {
    loading: { dapp, themeSwitch },
    walletBackdrop,
  },
}) => ({ dapp, walletBackdrop, themeSwitch });

export default connect(mapStateToProps, {
  // setReset,
  showWalletBackdrop,
  themeSwitchAction,
})(Layout);
