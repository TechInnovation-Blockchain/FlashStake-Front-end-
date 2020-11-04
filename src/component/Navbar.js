import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import logo from "../assets/xio-logo.svg";
import { connect } from "react-redux";
import logoLight from "../assets/xio-logo-light.svg";
import flashDark from "../assets/flash-dark.svg";
import flash from "../assets/FLASH.svg";
import {
  setExpandAccodion,
  setAnimationDirection,
  setRetroTheme,
} from "../redux/actions/uiActions";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  navContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2.5, 1),
    boxSizing: "border-box",
    width: "100%",
    backgroundColor: theme.palette.background.primary,
    position: "relative",
  },
  logo: {
    transition: "easeOut",
  },

  navlink: {
    textDecoration: "none",
    fontWeight: 900,
    color: theme.palette.text.secondary4,
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1, 1),
    },
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(1, 1),
    },
  },
  navLinkText: {
    // fontFamily: "Quota Bold",
    fontWeight: 900,
  },
  activeNavlink: {
    color: theme.palette.navLink.active,
    fontWeight: 900,
    // borderBottom: `1px solid ${theme.palette.shadowColor.main}`,
  },
  navlinkFlash: {
    textDecoration: "none",
    color: theme.palette.text.secondary,
  },
  navlinkBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
  },
}));

function Navbar({
  expanding,
  animation,
  setAnimationDirection,
  setExpandAccodion,
  themeMode,
  toggleThemeMode,
  changeApp,
  setRetroTheme,
  ...props
}) {
  const classes = useStyles();
  const history = useHistory();

  const [animate, setAnimate] = useState(false);
  const handleClick3 = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 3500);
  };

  const handleClick2 = () => {
    setExpandAccodion(false);
  };

  const [theme, setTheme] = useState(true);

  // const handleClick = () => {
  //   // themeSwitchAction();
  //   setTheme((val) => !val);
  //   if (theme === true) {
  //     themeMode = "dark";
  //     toggleThemeMode();
  //   } else {
  //     themeMode = "light";
  //     toggleThemeMode();
  //   }
  // };

  const handleClick = (changeApp) => {
    setRetroTheme(!changeApp);
  };

  let index;

  const routes = ["/stake", "/swap", "/pool", "/vote"];

  return (
    <Box className={classes.navContainer}>
      {/* <Box className={classes.navOuterBox}> */}
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/stake"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          // onClick={handleClick2}
          onClick={() => {
            index = routes.indexOf(history.location.pathname) - 0;
            setAnimationDirection(index);
            history.push("/stake");
            handleClick2();
          }}
          exact
        >
          <Typography variant="body1" className={classes.navLinkText}>
            STAKE
          </Typography>
        </NavLink>
      </Box>
      {/* <Divider orientation="vertical" flexItem /> */}
      {/* <img src={logo} alt="logo" width={40} className={classes.logo} /> */}
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/swap"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          onClick={() => {
            index = routes.indexOf(history.location.pathname) - 1;
            setAnimationDirection(index);

            history.push("/swap");
            handleClick2();
          }}
          exact
        >
          <Typography variant="body1" className={classes.navLinkText}>
            SWAP
          </Typography>
        </NavLink>
      </Box>
      {/* </Box> */}
      <Box className={classes.navlinkBox}>
        <img
          // src={themeMode === "dark" ? flash : logoLight}
          src={flash}
          alt="logo"
          width={animate ? 30 : 30}
          className={classes.logo}
          onClick={() => {
            // handleClick3();
            handleClick(changeApp);
          }}
        />
      </Box>
      {/* <Box className={classes.navOuterBox}> */}
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/pool"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          exact
          onClick={() => {
            index = routes.indexOf(history.location.pathname) - 2;
            setAnimationDirection(index);
            history.push("/pool");
            handleClick2();
          }}
        >
          <Typography variant="body1" className={classes.navLinkText}>
            POOL
          </Typography>
        </NavLink>
      </Box>
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/vote"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          exact
          onClick={() => {
            index = routes.indexOf(history.location.pathname) - 3;
            setAnimationDirection(index);

            history.push("/vote");
            handleClick2();
          }}
        >
          <Typography variant="body1" className={classes.navLinkText}>
            VOTE
          </Typography>
        </NavLink>
      </Box>
      {/* </Box> */}
    </Box>
  );
}

const mapStateToProps = ({ ui: { expanding, animation, changeApp } }) => ({
  expanding,
  animation,
  changeApp,
});

export default connect(mapStateToProps, {
  setExpandAccodion,
  setAnimationDirection,
  setRetroTheme,
})(Navbar);
