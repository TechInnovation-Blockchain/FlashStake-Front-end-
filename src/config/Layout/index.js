import React, { Fragment, createRef, useEffect } from "react";
import { connect } from "react-redux";
import {
  Container,
  Box,
  Backdrop,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import "./smooth.css";

import { WalletConnect, Snackbar } from "../../component";
import Routes from "../Routes";
// import { setReset } from "../../redux/actions/flashstakeActions";
import xordLogo from "../../assets/xord-light.png";
import "../../assets/css/main.css";
import AnimateHeight from "react-animate-height";
import Image from "../../assets/retroBackground.jpg";
import { store } from "../reduxStore";
import Disclaimer from "../../component/Disclaimer";

import blockZero from "../../assets/blockzero.png";
import blockZeroB from "../../assets/blockzerolight.png";
import { CONSTANTS } from "../../utils/constants";

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
    // transition: "all 0.5s ease",
    padding: theme.spacing(7, 1),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 1),
    },
    // transition: "all 2s ease",
  },
  parentText: {
    color: theme.palette.text.primary,
  },
  blockZeroLink: {
    color: theme.palette.xioRed.main,
  },
  contentContainer: {
    backgroundColor: theme.palette.background.secondary,
    overflow: "hidden",
    borderRadius: "10px",
    border: `1px solid ${theme.palette.border.secondary}`,
    width: "100%",
    // minHeight: 420,
    minHeight: "100%",
    // boxShadow: ` 0px 0px 8px 16px ${theme.palette.shadowColor.main} `,
    boxShadow: `0px 0px 50px 10px ${theme.palette.shadowColor.main}`,
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
    color: "#fff",
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
  branding: {
    marginTop: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
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
  toggleThemeMode2,
  themeSwitchAction,
  animation,
  theme,
}) {
  const classes = useStyles();

  const handleClose = () => {
    showWalletBackdrop(false);
  };

  useEffect(() => {
    const body = document.querySelector("#body");
    // css = {
    //   backgroundImage: `require(url(${Image}))`,
    //   backgroundRepeat: no-repeat,
    //   backgroundAttachment: fixed,
    //   backgroundPosition: center,
    //   backgroundSize: cover,
    // };
    // body.style.backgroundColor = "#171717";

    if (themeMode === "dark") {
      body.style.background = "#000000";
    } else if (themeMode === "retro") {
      // body.style.background = "none";
      body.style.backgroundImage = `url(${Image})`;
      body.style.backgroundPosition = "center";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundAttachment = "fixed";
      body.style.backgroundSize = "cover";
    } else {
      body.style.background = `#f5f5f5`;
    }
  }, [themeMode]);

  const [open, setOpen] = React.useState(
    !localStorage.getItem("disabledDisclaimer")
  );

  useEffect(() => {
    validateTokensList();
  }, []);

  const validateTokensList = () => {
    let tokenList = JSON.parse(localStorage.getItem("tokensURI"));

    const tok = CONSTANTS.TOKENS_LIST.find(
      (_item) => _item.name === tokenList?.name
    );

    if (tok && tokenList) {
      if (tokenList?.uri !== tok?.uri)
        return localStorage.setItem("tokensURI", JSON.stringify(tok));
      // console.log(tok);
    } else {
      return;
    }
  };

  return (
    <Fragment>
      <Disclaimer open={open} setOpen={setOpen} />
      {/* <Box> */}
      <Container maxWidth="sm" className={classes.mainContainer}>
        {/* <Disclaimer open={open} setOpen={setOpen} /> */}

        <Box
          // ref={ref}
          className={`transitionEase ${classes.contentContainer} contentContainer1 `}
        >
          <Routes
            themeMode={themeMode}
            toggleThemeMode={toggleThemeMode}
            toggleThemeMode2={toggleThemeMode2}
          />
        </Box>

        <Backdrop
          className={classes.backdrop2}
          open={walletBackdrop}
          onClick={handleClose}
        ></Backdrop>
        <WalletConnect toggleThemeMode={toggleThemeMode}>
          <Box className={classes.branding}>
            <Typography className={classes.parentText} variant="body2">
              Created By{" "}
            </Typography>

            <a
              className={classes.blockZeroLink}
              href="https://blockzerolabs.io/"
              target="_blank"
            >
              <img src={blockZeroB} width={40} />
            </a>
            <Typography className={classes.parentText} variant="body2">
              Blockzero Labs
            </Typography>
          </Box>
        </WalletConnect>
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
          <Typography variant="body1" className={classes.poweredText}>
            POWERED BY
          </Typography>
          <img src={xordLogo} alt="xord.one" width={70} />
        </a>
      </Backdrop>
      <div ref={walletBtnRef}></div>

      {/* </Box> */}
    </Fragment>
  );
}

const mapStateToProps = ({
  ui: {
    loading: { dapp, themeSwitch },
    walletBackdrop,
    animation,
    theme,
  },
}) => ({ dapp, walletBackdrop, themeSwitch, theme });

export default connect(mapStateToProps, {
  // setReset,
  showWalletBackdrop,
  themeSwitchAction,
})(Layout);
