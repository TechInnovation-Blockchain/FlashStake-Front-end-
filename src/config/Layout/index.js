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
import { setReset } from "../../redux/actions/flashstakeActions";
import logo from "../../assets/xio-logo.svg";
import logoLight from "../../assets/xio-logo-light.svg";
import xioAnim from "../../assets/xio-animated.gif";
import xordLogo from "../../assets/xord-logo.png";
import { Button } from "../../component";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

import {
  showWalletBackdrop,
  themeSwitchAction,
} from "../../redux/actions/uiActions";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { ExpandableBox } from "../../component";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: theme.spacing(4, 0),
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: theme.palette.background.secondary2,

    // [theme.breakpoints.down("md")]: {
    //   padding: theme.spacing(4, 12),
    // },

    // [theme.breakpoints.down("sm")]: {
    //   padding: theme.spacing(4, 18),
    // },

    maxWidth: "250px",

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(4, 14),
      maxwidth: "10px",
    },
  },
  contentContainer: {
    border: `1px solid ${theme.palette.border.main}`,
    backgroundColor: theme.palette.background.secondary,
    marginTop: theme.spacing(2),
    overflow: "hidden",
    borderRadius: "10px",
    border: "1px solid #282828",
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

const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    marginBottom: -1,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

export let walletBtnRef = createRef();

function Layout({
  dapp,
  themeSwitch,
  setReset,
  showWalletBackdrop,
  walletBackdrop,
  themeMode,
  toggleThemeMode,
  themeSwitchAction,
}) {
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState("panel1");

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleClose = () => {
    showWalletBackdrop(false);
  };

  const [theme, setTheme] = useState(true);

  const handleClick = () => {
    // themeSwitchAction();
    setTheme((val) => !val);
    if (theme === true) {
      themeMode = "dark";
      toggleThemeMode();
    } else {
      themeMode = "light";
      toggleThemeMode();
    }
  };

  useEffect(() => {
    const body = document.querySelector("#body");
    // body.style.backgroundColor = "#171717";

    themeMode === "dark"
      ? (body.style.backgroundColor = "#171717")
      : (body.style.backgroundColor = "#f5f5f5");
  }, [themeMode]);

  return (
    <Fragment>
      <Container maxWidth="xs" className={classes.mainContainer}>
        <Box>
          {/* <img
            src={themeMode === "dark" ? logo : logoLight}
            alt="logo"
            width={40}
            className={classes.logo}
            onClick={handleClick}
          /> */}
          <Box className={`transitionEase ${classes.contentContainer}`}>
            <Routes />
          </Box>
          {/* <Accordion
            square
            expanded={expanded === "panel1"}
            onChange={handleChange("panel1")}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
            ></AccordionSummary>
            <AccordionDetails></AccordionDetails>
          </Accordion> */}
          <Box className={classes.btn2}>
            {/* <Button className={classes.btn} variant="red">
              FLASHSTAKE
            </Button> */}
            {/* <Accordion title="A">
              <span className="accordion-text">aaaaaa</span>
            </Accordion> */}
          </Box>
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
  setReset,
  showWalletBackdrop,
  themeSwitchAction,
})(Layout);
