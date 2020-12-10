import React, { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import logo from "../assets/xio-logo.svg";
import { connect } from "react-redux";
import logoLight from "../assets/FlashPro5.svg";
import flashDark from "../assets/flash-dark.svg";
import flash from "../assets/FLASH2.svg";
import $Flash from "../assets/Tokens/$FLASH.png";
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
  toggleThemeMode2,
  ...props
}) {
  const classes = useStyles();
  const history = useHistory();

  const [animate, setAnimate] = useState(false);
  const [preTheme, setPreTheme] = useState(themeMode);
  // const handleClick3 = () => {
  //   setAnimate(true);
  //   setTimeout(() => {
  //     setAnimate(false);
  //   }, 3500);
  // };

  // useEffect(() => {
  //   if (localStorage.getItem("themeMode") === "retro") {
  //     localStorage.setItem("themeMode", "dark");
  //   }
  // }, []);

  const handleClick2 = () => {
    setExpandAccodion(false);
  };

  const [theme, setTheme] = useState(true);

  let watchDouble = 0;
  const toggle = () => {
    watchDouble += 1;
    setTimeout(() => {
      if (watchDouble === 2) {
        toggleThemeMode2();
      } else if (watchDouble === 1) {
        if (localStorage.getItem("themeMode") !== "retro") {
          toggleThemeMode();
        }
      }
      watchDouble = 0;
    }, 500);
  };

  let index;

  const routes = ["/stake", "/swap", "/pool", "/create"];

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
          src={themeMode === "retro" ? $Flash : flash}
          // src={themeModeflash}
          alt="logo"
          width={themeMode === "dark" || themeMode === "light" ? 40 : 30}
          // width={animate ? 30 : 30}
          className={classes.logo}
          onClick={() => {
            toggle();
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
          to="/create"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          exact
          onClick={() => {
            index = routes.indexOf(history.location.pathname) - 3;
            setAnimationDirection(index);

            history.push("/create");
            handleClick2();
          }}
        >
          <Typography variant="body1" className={classes.navLinkText}>
            CREATE
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
