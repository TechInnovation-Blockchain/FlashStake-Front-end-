import React from "react";
import { Snackbar as SnackbarMui, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { connect } from "react-redux";
import { showSnackbar, hideSnackbar } from "../redux/actions/uiActions";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/styles";
import { Link } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  snackbarStyles: {
    width: 280,
    display: "flex",
    alignItems: "center",

    textAlign: "left",
    backgroundColor: theme.palette.background.secondary,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.main}`,
    "& .MuiAlert-icon": {
      color: theme.palette.xioRed.main,
    },
  },
  link: {
    textDecoration: "none",
    display: "flex",
    // justifyContent: "center",
    alignItems: "center",
    color: theme.palette.xioRed.main,
  },
  linkIcon: {
    color: theme.palette.xioRed.main,
    paddingRight: 5,
    marginTop: 2,
    // justifyContent: "center",
    alignItems: "flex-start",
  },
}));

function Snackbar({ snackbar, hideSnackbar, showSnackbar }) {
  const classes = useStyles();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    hideSnackbar();
  };

  return (
    <SnackbarMui
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      // open={snackbar.open}
      open={snackbar.open}
      // open={true}
      {...(snackbar.noAutoHide ? {} : { autoHideDuration: 6000 })}
      onClose={handleClose}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.type}
        className={classes.snackbarStyles}
      >
        {snackbar.message}
        <br />
        {snackbar.typeT === "txnEtherScan" ? (
          <a
            className={classes.link}
            href={`https://ropsten.etherscan.io/tx/${snackbar.txn}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Link fontSize="small" className={classes.linkIcon} />
            View on Etherscan.
          </a>
        ) : null}
      </Alert>
    </SnackbarMui>
  );
}

const mapStateToProps = ({ ui: { snackbar } }) => ({ snackbar });

export default connect(mapStateToProps, { hideSnackbar, showSnackbar })(
  Snackbar
);
