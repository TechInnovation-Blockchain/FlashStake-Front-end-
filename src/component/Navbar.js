import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Divider from "@material-ui/core/Divider";
import logo from "../assets/xio-logo.svg";

const useStyles = makeStyles((theme) => ({
  navContainer: {
    display: "flex",
    // justifyContent: "space-between",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: theme.spacing(2),
    backgroundColor: theme.palette.background.primary,
    // borderBottom: `1px solid ${theme.palette.border.main}`,
    // maxWidth: "400px",

    position: "relative",
  },
  logo: {},

  navlink: {
    textDecoration: "none",
    color: theme.palette.text.secondary,
    margin: theme.spacing(1, 2),
    padding: theme.spacing(1),
    fontSize: 10,
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
  },
  navLinkText: {
    fontSize: "10px",
  },
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <Box className={classes.navContainer}>
      <Box className={classes.navlinkBox}>
        <NavLink
          to="/flashstake"
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

        <Box>
          <img
            // src={themeMode === "dark" ? logo : logoLight}
            src={logo}
            alt="logo"
            width={30}
            className={classes.logo}
            // onClick={handleClick}
          />
        </Box>
      </Box>
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
    </Box>
  );
}
