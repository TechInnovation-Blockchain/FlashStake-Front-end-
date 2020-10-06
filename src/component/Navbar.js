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
    // justifyContent: "space-between",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    width: "100%",
    backgroundColor: theme.palette.background.primary,
    // borderBottom: `1px solid ${theme.palette.border.main}`,
    // maxWidth: "400px",

    position: "relative",
  },
  logo: {
    transition: "easeOut",
  },

  navlink: {
    textDecoration: "none",
    color: theme.palette.text.secondary,
    margin: theme.spacing(1, 2),
    padding: theme.spacing(1),
    fontSize: 10,
    // width: "20%",
    // padding: theme.spacing(0, 5),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1, 1),
    },

    [theme.breakpoints.down("xs")]: {
      margin: theme.spacing(1, 1),
    },
  },
  activeNavlink: {
    color: theme.palette.text.primary,
    "& .MuiTypography-root": {
      fontWeight: 900,
    },
  },
  navlinkFlash: {
    textDecoration: "none",
    color: theme.palette.text.secondary,
    // margin: theme.spacing(0, 3),
    // borderRight: `1px solid ${theme.palette.border.main}`,
    // padding: theme.spacing(0, 5),
    // [theme.breakpoints.down("xs")]: {
    // margin: theme.spacing(0, 2),
    // },
  },
  navlinkBox: {
    display: "flex",
    // flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
  },

  navLinkText: {
    fontSize: "10px",
  },
  // fadeOut: {
  //   opacity: 0,
  //   width: 0,
  //   height: 0,
  //   transition: "width 0.5s 0.5s, height 0.5s 0.5s, opacity 0.5s",
  // },
  // fadeIn: {
  //   opacity: 1,
  //   // width:100px,
  //   // height:100px,
  //   transition: "width 0.5s, height 0.5s, opacity 0.5s 0.5s",
  // },
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
          <Typography variant="h6" className={classes.navLinkText}>
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
          <Typography variant="h6" className={classes.navLinkText}>
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
          <Typography variant="h6" className={classes.navLinkText}>
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
          <Typography variant="h6" className={classes.navLinkText}>
            VOTE
          </Typography>
        </NavLink>
      </Box>
      {/* </Box> */}
    </Box>
  );
}
