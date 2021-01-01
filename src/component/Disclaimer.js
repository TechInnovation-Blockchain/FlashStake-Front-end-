import React from "react";
// import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Button } from "../component";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  disclaimerBg: {
    backgroundColor: `${theme.palette.background.secondary} !important`,

    "& .MuiPaper-root": {
      backgroundColor: `${theme.palette.background.secondary} !important`,
    },
  },
  titleDisclaim: {
    display: "flex",
    justifyContent: "center",
  },
  BTn: {
    color: theme.palette.xioRed.main,
  },
  hyperlink: {
    color: theme.palette.xioRed.main,
  },
}));

export default function AlertDialogSlide({ open, setOpen }) {
  const handleClose = () => {
    localStorage.setItem("disabledDisclaimer", true);
    setOpen(false);
  };

  const classes = useStyles();
  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        // keepMounted
        onClose={handleClose}
        className={classes.disclaimerBg}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          className={classes.titleDisclaim}
          id="alert-dialog-slide-title"
        >
          DISCLAIMER
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Typography variant="body2">
              While we are excited for the world to experience the first ever
              time travel of money, we wanted to take a step back into the past
              and add some very important reminders. <br /> <br /> This is a new
              and experimental technology. As with all new protocols, especially
              in DeFi, this technology should be used with caution and at your
              own discretion. <br /> <br />
              We understand and acknowledge the importance of security. Over the
              last four months, 1000+ people have helped battle test the Flash
              Protocol. With over $75,000 paid throughout the security and
              auditing process, not one smart contract issue was discovered.{" "}
              <br /> <br /> Flash has been audited by{" "}
              <a
                className={classes.hyperlink}
                href="http://solidified.io/"
                target="_blank"
              >
                Solidified.io
              </a>
              , the same agency who has audited Loopring, Argent, Kyper Network,
              Gnosis, and many other technologies. You can view the audit{" "}
              <a
                className={classes.hyperlink}
                href="https://github.com/solidified-platform/audits/blob/master/Audit%20Report%20-%20Flash%20Protocol%20%5B04.12.2020%5D.pdf"
                target="_blank"
              >
                here
              </a>
              . <br /> <br /> Flash was built by{" "}
              <a
                className={classes.hyperlink}
                href="https://blockzerolabs.io/"
                target="_blank"
              >
                Blockzero Labs
              </a>
              , a blockchain token studio with over 15 core team members from
              all across the world. <br /> <br />
              Flash is a 100% permissionless protocol. There are no admin keys.
              There are no backdoors. Now that we are on mainnet, we don't
              control Flash any more than you do. In accepting this reality, you
              acknowledge the risks and implications of using the Flash
              Protocol.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.titleDisclaim}>
          <Button onClick={handleClose} className={classes.BTn}>
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
