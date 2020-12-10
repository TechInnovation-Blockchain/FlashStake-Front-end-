import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
import { Box, Typography, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";

import { trunc } from "../utils/utilFunc";
import Fade from "./Fade";
import WalletsDialogue from "./WalletsDialogue";

const useStyles = makeStyles((theme) => ({
  expandableBox: {
    width: 250,
    backgroundColor: "#555555",
    padding: "2px 0",
    marginBottom: 1,
  },
  textColor: {
    color: "#fff",
  },
  expandableInner: {
    margin: 20,
    display: "flex",
  },
  walletTextColor: {
    color: theme.palette.xioRed.main,
    fontSize: 12,
    cursor: "pointer",
    marginBottom: 5,
    fontWeight: 700,
  },
}));

export const addressShorten = (address) => {
  if (address) {
    return `${address.slice(0, 6)}...${address.slice(
      address.length - 2,
      address.length
    )}`;
  }
};

const ExpandableBox = ({
  style,
  currentStaked,
  balance,
  open,
  web3context,
  walletList,
  activateWallet,
}) => {
  const classes = useStyles();
  const [expandOpen, setExpandOpen] = useState(false);
  return (
    <Fragment>
      <WalletsDialogue
        // className={classes.connectWalletButton}
        heading={"CHANGE WALLET"}
        web3context={web3context}
        items={walletList}
        activate={activateWallet}
        open={expandOpen}
        setOpen={setExpandOpen}
        // address={addressShorten(web3context.account)}
      />

      <Fade in={open}>
        <Box className={classes.expandableBox}>
          <Box className={classes.expandableInner}>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                className={`${classes.textColor}`}
                style={{ fontSize: 10 }}
              >
                RESTAKEABLE
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                className={`${classes.textColor}`}
                style={{ fontSize: 10 }}
              >
                WALLET
              </Typography>
            </Grid>
          </Box>
          <Box className={classes.expandableInner}>
            <Grid item xs={6}>
              <Tooltip
                title={`${currentStaked.availableStakeAmount || 0} $FLASH`}
              >
                <Typography variant="body2" className={`${classes.textColor}`}>
                  <b>{trunc(currentStaked.availableStakeAmount)} $FLASH</b>
                </Typography>
              </Tooltip>
            </Grid>
            <Grid item xs={6}>
              <Tooltip title={`${balance} $FLASH`}>
                <Typography variant="body2" className={`${classes.textColor}`}>
                  <b>{trunc(balance)} $FLASH</b>
                </Typography>
              </Tooltip>
            </Grid>
          </Box>
          <Typography
            onClick={() => {
              // !(web3context.active || web3context.account)
              // ?
              setExpandOpen(true);
              // :
              // setOpenBox((val) => !val);
            }}
            variant="body1"
            className={`${classes.walletTextColor}`}
          >
            CHANGE WALLET
          </Typography>
        </Box>
      </Fade>
    </Fragment>
  );
};

const mapStateToProps = ({
  user: { currentStaked },
  flashstake: { balance },
}) => ({
  currentStaked,
  balance,
});

export default connect(mapStateToProps)(ExpandableBox);
