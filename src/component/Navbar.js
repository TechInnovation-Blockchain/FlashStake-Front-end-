import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Divider from "@material-ui/core/Divider";
import logo from "../assets/xio-logo.svg";
import animatedLogo from "../assets/xio-logo.gif";

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
    color: theme.palette.text.secondary,
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1, 1),
    },
    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(1, 1),
    },
  },
  navLinkText: {
    fontWeight: 700,
  },
  activeNavlink: {
    color: theme.palette.text.primary,
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

export default function Navbar() {
  const classes = useStyles();

  const [animate, setAnimate] = useState(false);
  // // console.log(animate);
  const handleClick = () => {
    setAnimate(true);
    setTimeout(() => {
      setAnimate(false);
    }, 3500);
  };

  return (
    <Box className={classes.navContainer}>
      {/* <Box className={classes.navOuterBox}> */}
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/stake"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
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
          // src={themeMode === "dark" ? logo : logoLight}
          src={animate ? animatedLogo : logo}
          alt="logo"
          width={animate ? 30 : 30}
          className={classes.logo}
          onClick={handleClick}
        />
      </Box>
      {/* <Box className={classes.navOuterBox}> */}
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/pool"
          className={classes.navlink}
          activeClassName={classes.activeNavlink}
          exact
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
