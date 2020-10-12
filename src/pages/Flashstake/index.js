import React, { useEffect, useState, Fragment, useCallback } from "react";
import Web3 from "web3";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { connect } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

import {
  Button,
  DropdownDialog,
  Dialog,
  PageAnimation,
  Table,
} from "../../component";
import {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIO,
  calculateReward,
  checkAllowanceXIO,
  getBalanceXIO,
  stakeXIO,
  setDialogStep,
  setReset,
  setInitialValues,
} from "../../redux/actions/flashstakeActions";
import { setExpandAccodion } from "../../redux/actions/uiActions";
import { debounce } from "../../utils/debounceFunc";
import { trunc } from "../../utils/utilFunc";
import { setLoading, showWalletBackdrop } from "../../redux/actions/uiActions";
import { Link } from "@material-ui/icons";
// import maxbtn from "../../assets/maxbtn.svg";
import { setRefetch } from "../../redux/actions/dashboardActions";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-evenly",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    // fontSize: 10,
    marginBottom: theme.spacing(1),
    // [theme.breakpoints.down("xs")]: {
    //   fontSize: 8,
    // },
  },
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 700,
  },
  redText: {
    // fontSize: 10,
    fontWeight: 700,
    color: theme.palette.xioRed.main,
  },
  infoText: {
    // fontSize: 10,
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  infoTextSpan: {
    // fontSize: 10,
    fontWeight: 900,
    color: "#fff",
    position: "relative",
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  textBold: {
    fontWeight: 700,
  },
  xIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 900,
    marginTop: 30,
    // fontSize: 15,
    alignSelf: "center",
    margin: theme.spacing(2),
  },
  checkbox: {
    padding: 0,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  textField: {
    background: theme.palette.background.secondary2,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      lineHeight: 1.5,
      textAlign: "center",
    },
    "& .Mui-error": {
      color: theme.palette.xioRed.main,
    },
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textFieldContainer: {
    position: "relative",
  },
  maxIconButton: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    background: theme.palette.background.secondary,
    "&.Mui-disabled": {
      display: "none",
    },
    "& svg": {
      fill: "#9191A7",
    },
    "&:hover": {
      background: theme.palette.background.primary,
      "& svg": {
        fill: theme.palette.xioRed.main,
      },
    },
    transition: "none !important",
  },
  linkIcon: {
    color: theme.palette.xioRed.main,
    paddingRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  btnPaddingLeft: {
    paddingLeft: theme.spacing(1),
  },
  btnPaddingRight: {
    paddingRight: theme.spacing(1),
  },
  cursorPointer: {
    cursor: "pointer",
  },
  restakeableXio: {
    display: "flex",

    justifyContent: "center",
    alignItems: "center ",
  },
  restakeText: {
    color: "#555555",
    fontWeight: 700,
    // fontSize: 11,
    cursor: "pointer",
  },
  dropDown: {
    "& .makeStyles-dropdown": {
      backgroundColor: "#000",
    },
  },
  btn: {
    marginTop: theme.spacing(2),
  },
  btn3: {
    backgroundColor: "#1A1A1A",
    padding: "0 !important",
    margin: "0 !important",

    "& .MuiAccordionSummary-content": {
      display: "block",
      margin: 0,
    },
  },
  _btn3: {
    borderTopWidth: 1,
    borderTopRightRadius: "10px",
    borderTopLeftRadius: "10px",
    backgroundColor: "#1A1A1A",
    padding: "0 !important",

    "& .MuiAccordionSummary-content": {
      display: "block",
      margin: 0,
    },
  },
  dashboardAccordian: {
    color: theme.palette.text.grey,
    "&:hover": {
      color: "#c66065",
    },
  },
  accordion: {
    backgroundColor: "#1A1A1A",
  },
  stakeDashBtn: {
    color: "inherit",
    fontWeight: 700,
  },
  icon: {
    color: theme.palette.xioRed.main,
  },
  accordionDetails: {
    borderBottom: `1px solid ${theme.palette.border.secondary} !important`,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.palette.text.gray,
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  loaderStyle: {
    marginBottom: -2,
    // position: "absolute",
    // left: 2,
    // top: "10%",
  },
}));

const Accordion = withStyles({
  root: {
    // border: "1px solid rgba(0, 0, 0, .125)",
    backgroundColor: "#121212",
    boxShadow: "none",

    "&.MuiAccordion-root.Mui-expanded": {
      margin: 0,
    },

    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      // margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    marginBottom: -1,
    padding: 0,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      // margin: "12px 0",
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    // padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

function Flashstake({
  getFlashstakeProps,
  stakeTokens,
  rewardTokens,
  selectedStakeToken,
  selectedRewardToken,
  setSelectedStakeToken,
  setSelectedRewardToken,
  selectedPortal,
  allowanceXIO,
  getApprovalXIO,
  calculateReward,
  reward,
  loading: loadingRedux,
  active,
  account,
  checkAllowanceXIO,
  getBalanceXIO,
  balanceXIO,
  stakeXIO,
  setLoading,
  dialogStep,
  setDialogStep,
  stakeRequest,
  unstakeRequest,
  reset,
  setReset,
  chainId,
  stakeTxnHash,
  setInitialValues,
  initialValues,
  showWalletBackdrop,
  portals,
  currentStaked,
  pools,
  walletBalance,
  setRefetch,
  setExpandAccodion,
  expanding,
}) {
  const classes = useStyles();
  const web3context = useWeb3React();
  const history = useHistory();

  useEffect(() => {
    // if (history.location.pathname === "/") {
    //   setRoute(true);
    // }
    console.log("Called");
    console.log(history.location.pathname);
  }, [history.location.pathname]);

  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [expanded2, setExpanded2] = useState(true);

  const debouncedCalculateReward = useCallback(
    debounce(calculateReward, 200),
    []
  );

  const [days, setDays] = useState(initialValues.days);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const regex = /^\d*(.(\d{1,18})?)?$/;

  //#region functions

  const onChangeDays = ({ target: { value } }) => {
    if (Number(value) || value === "" || value === "0") {
      setDays(parseInt(value) || value);
    } else {
      setDays((val) => val);
    }
  };
  const onChangeQuantity = ({ target: { value } }) => {
    if (Number(value) || value === "" || /^[0]?[.]?$/.test(value)) {
      if (regex.test(value)) {
        // console.log(value, regex.test(value));
        setQuantity(
          value[value.length - 1] === "." || !Number(value) ? value : value
        );
      }
      // console.log(value, regex.test(value), quantity);
    } else {
      setQuantity((val) => val);
    }
  };

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    document.title = "Stake - XIO | The Future is at Stake";
    // setLoading({ dapp: true });
    setRefetch(true);
  }, [setRefetch]);

  useEffect(() => {}, [quantity, days]);

  useEffect(() => () => setInitialValues(quantity, days), [
    days,
    quantity,
    setInitialValues,
  ]);

  useEffect(() => {
    if (reset) {
      getBalanceXIO();
      setDays("");
      setQuantity("");
      setReset(false);
    }
  }, [reset, setReset, getBalanceXIO]);

  useEffect(() => {
    if (selectedPortal) {
      debouncedCalculateReward(quantity, days);
      const _rewardRefreshInterval = setInterval(() => {
        // console.log("Reward updated.");
        debouncedCalculateReward(quantity, days);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [setLoading, selectedPortal, days, quantity, debouncedCalculateReward]);

  useEffect(() => {
    if (active && account) {
      checkAllowanceXIO();
      getBalanceXIO();
      showWalletBackdrop(false);
    }
  }, [active, account, checkAllowanceXIO, getBalanceXIO, showWalletBackdrop]);

  const onClickStake = (quantity, days) => {
    setDialogStep("pendingStake");
    setShowStakeDialog(true);
    stakeXIO(quantity, days);
  };

  const onClickApprove = () => {
    setDialogStep("pendingApproval");
    setShowStakeDialog(true);
    getApprovalXIO("stake");
  };

  const onClickUnstake = () => {
    setDialogStep("pendingUnstake");
    setShowStakeDialog(true);
  };

  const onClickClose = () => {
    setReset(true);
    setShowStakeDialog(false);
  };

  const closeDialog = () => {
    setShowStakeDialog(false);
  };

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
  };

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);

  //#endregion
  // console.log(expanded2);
  return (
    <PageAnimation in={true} reverse>
      <Fragment>
        <Box className={classes.contentContainer}>
          <Accordion square expanded={expanded2}>
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              style={{ display: "none" }}
            >
              {/* <Typography>Collapsible Group Item #1</Typography> */}
            </AccordionSummary>

            <AccordionDetails
              style={{ paddingTop: "20px" }}
              className={classes.accordionDetails}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="overline"
                    className={classes.secondaryText}
                  >
                    WHAT TOKEN DO YOU WANT TO EARN
                  </Typography>
                  <DropdownDialog
                    className={classes.dropDown}
                    items={pools}
                    selectedValue={selectedRewardToken}
                    onSelect={setSelectedRewardToken}
                    heading="SELECT TOKEN"
                  />
                </Grid>
                <Grid container item xs={12}>
                  <Box flex={1}>
                    <Typography
                      variant="overline"
                      className={classes.secondaryText}
                    >
                      QUANTITY
                    </Typography>
                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        error={
                          active &&
                          account &&
                          parseFloat(quantity) > parseFloat(walletBalance)
                        }
                        fullWidth
                        placeholder="0.0"
                        value={quantity}
                        onChange={onChangeQuantity}
                        type="number"
                        inputMode="numeric"
                        pattern={regex}
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => (e.target.placeholder = "0.0")}
                      />
                      {/* <IconButton
                    className={classes.maxIconButton}
                    disabled={
                      !(active || account) || quantity == getMaxQuantity()
                    }
                    onClick={setMaxQuantity}
                  >
                    <MaxBtn width={10} />
                  </IconButton> */}
                    </Box>
                  </Box>

                  <Typography variant="h6" className={classes.xIcon}>
                    +
                  </Typography>
                  <Box flex={1}>
                    <Typography
                      variant="overline"
                      className={classes.secondaryText}
                    >
                      DURATION (hrs)
                    </Typography>

                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        fullWidth
                        placeholder="0"
                        value={days}
                        onChange={onChangeDays}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => (e.target.placeholder = "0")}
                      />
                      {/* <IconButton
                    className={classes.maxIconButton}
                    disabled={!(active || account) || days == getMaxDays()}
                    onClick={() => setDays(getMaxDays())}
                  >
                    <MaxBtn width={10} />
                  </IconButton> */}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  {selectedRewardToken?.tokenB?.symbol ? (
                    <Typography variant="overline" className={classes.infoText}>
                      IF YOU STAKE{" "}
                      <span className={classes.infoTextSpan}>
                        {quantity || 0} XIO{" "}
                      </span>{" "}
                      FOR{" "}
                      <span className={classes.infoTextSpan}>
                        {days || 0} DAYS
                      </span>{" "}
                      YOU WILL{" "}
                      <span className={classes.infoTextSpan}>IMMEDIATELY</span>{" "}
                      GET{" "}
                      {loadingRedux.reward ? (
                        <CircularProgress
                          size={12}
                          className={classes.loaderStyle}
                        />
                      ) : (
                        <Tooltip
                          title={`${Web3.utils.fromWei(reward)} ${
                            selectedRewardToken?.tokenB?.symbol || ""
                          }`}
                        >
                          <span className={classes.infoTextSpan}>
                            {trunc(Web3.utils.fromWei(reward))}{" "}
                            {selectedRewardToken?.tokenB?.symbol || ""} .
                          </span>
                        </Tooltip>
                      )}
                    </Typography>
                  ) : (
                    <Typography variant="overline" className={classes.redText}>
                      SELECT A TOKEN TO VIEW REWARDS
                    </Typography>
                  )}
                </Grid>

                {!allowanceXIO ? (
                  <Grid container item xs={12} onClick={showWalletHint}>
                    <Grid item xs={6} className={classes.btnPaddingRight}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={
                          !allowanceXIO && !loadingRedux.approval
                            ? onClickApprove
                            : () => {}
                        }
                        disabled={
                          allowanceXIO ||
                          !active ||
                          !account ||
                          quantity <= 0 ||
                          days <= 0 ||
                          reward <= 0 ||
                          !selectedPortal ||
                          loadingRedux.reward ||
                          loadingRedux.approval ||
                          chainId !== 4
                        }
                        loading={
                          loadingRedux.approval && loadingRedux.approvalXIO
                        }
                      >
                        {loadingRedux.approval && loadingRedux.approvalXIO
                          ? "APPROVING"
                          : `APPROVE ${selectedStakeToken}`}
                      </Button>
                    </Grid>
                    <Grid item xs={6} className={classes.btnPaddingLeft}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={
                          !allowanceXIO
                            ? () => {}
                            : () => onClickStake(quantity, days)
                        }
                        disabled={
                          !allowanceXIO ||
                          !active ||
                          !account ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          loadingRedux.stake ||
                          chainId !== 4 ||
                          reward <= 0 ||
                          (active &&
                            account &&
                            parseFloat(quantity) > parseFloat(walletBalance))
                        }
                        loading={loadingRedux.stake}
                      >
                        STAKE
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Fragment>
                    <Grid container item xs={12} onClick={showWalletHint}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={
                          !allowanceXIO
                            ? () => {}
                            : () => onClickStake(quantity, days)
                        }
                        disabled={
                          !active ||
                          !account ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          loadingRedux.stake ||
                          chainId !== 4 ||
                          reward <= 0 ||
                          (active &&
                            account &&
                            parseFloat(quantity) > parseFloat(walletBalance))
                        }
                        loading={loadingRedux.stake}
                      >
                        STAKE
                      </Button>
                    </Grid>
                  </Fragment>
                )}

                {!allowanceXIO &&
                active &&
                account &&
                selectedRewardToken &&
                !loadingRedux.allowance ? (
                  <Grid item xs={12}>
                    <Typography variant="overline" className={classes.redText}>
                      BEFORE YOU CAN <b>STAKE</b>, YOU MUST <b>APPROVE XIO</b>
                    </Typography>
                  </Grid>
                ) : null}
                {!(active && account) ? (
                  <Grid
                    item
                    xs={12}
                    onClick={showWalletHint}
                    className={classes.cursorPointer}
                  >
                    <Typography variant="overline" className={classes.redText}>
                      CONNECT YOUR WALLET TO STAKE
                    </Typography>
                  </Grid>
                ) : chainId !== 4 ||
                  web3context.error instanceof UnsupportedChainIdError ? (
                  <Grid item xs={12}>
                    <Typography variant="overline" className={classes.redText}>
                      CHANGE NETWORK TO <b>RINKEBY</b> TO START <b>STAKING</b>
                    </Typography>
                  </Grid>
                ) : null}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion square expanded={!expanded2}>
            <AccordionSummary
              aria-controls="panel2d-content"
              id="panel2d-header"
              onClick={() => setExpanded2(!expanded2)}
              className={`${classes.dashboardAccordian} ${
                expanded2 ? classes.btn3 : classes._btn3
              }`}
            >
              {expanded2 ? (
                <ArrowDropUpIcon size="large" className={classes.icon} />
              ) : (
                <ArrowDropDownIcon size="large" className={classes.icon} />
              )}
              <Typography variant="body2" className={classes.stakeDashBtn}>
                STAKE DASHBOARD
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordion}>
              <Table onClickUnstake={onClickUnstake} />
            </AccordionDetails>
          </Accordion>
        </Box>

        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={["APPROVE XIO", "STAKE"]}
          title="FLASHSTAKE"
          onClose={() => setShowStakeDialog(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep.includes(item)
          )}
          step={dialogStep}
          stepperShown={
            dialogStep === "pendingApproval" ||
            dialogStep === "flashstakeProposal"
          }
          // stepperShown={true}

          // status="success"

          //successApproval: (
          //  <Fragment>
          //    <Typography variant="body1" className={classes.textBold}>
          //      APPROVAL
          //      <br />
          //      <span className={classes.greenText}>SUCCESSFUL</span>
          //    </Typography>
          //    <Button variant="red" fullWidth onClick={onClickClose}>
          //      CLOSE
          //    </Button>
          //  </Fragment>
          //),
        >
          {
            {
              pendingApproval: (
                <Fragment>
                  <Typography variant="body2" className={classes.textBold}>
                    APPROVAL PENDING
                    <br />
                  </Typography>
                </Fragment>
              ),

              flashstakeProposal: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    STAKE
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    IF YOU STAKE{" "}
                    <span className={classes.infoTextSpan}>
                      {quantity || 0} XIO{" "}
                    </span>{" "}
                    FOR{" "}
                    <span className={classes.infoTextSpan}>
                      {days || 0} DAYS
                    </span>{" "}
                    YOU WILL{" "}
                    <span className={classes.infoTextSpan}>IMMEDIATELY</span>{" "}
                    GET{" "}
                    {loadingRedux.reward ? (
                      <CircularProgress
                        size={12}
                        className={classes.loaderStyle}
                      />
                    ) : (
                      <Tooltip
                        title={`${Web3.utils.fromWei(reward)} ${
                          selectedRewardToken?.tokenB?.symbol || ""
                        }`}
                      >
                        <span className={classes.infoTextSpan}>
                          {trunc(Web3.utils.fromWei(reward))}{" "}
                          {selectedRewardToken?.tokenB?.symbol || ""}
                        </span>
                      </Tooltip>
                    )}
                  </Typography>
                  <Button
                    variant="red"
                    fullWidth
                    onClick={
                      !allowanceXIO
                        ? () => {}
                        : () => onClickStake(quantity, days)
                    }
                    disabled={
                      !active ||
                      !account ||
                      !selectedPortal ||
                      quantity <= 0 ||
                      days <= 0 ||
                      loadingRedux.reward ||
                      loadingRedux.stake ||
                      chainId !== 4 ||
                      reward <= 0 ||
                      (active &&
                        account &&
                        parseFloat(quantity) > parseFloat(walletBalance))
                    }
                    loading={loadingRedux.approval}
                  >
                    STAKE
                  </Button>
                </Fragment>
              ),
              failedApproval: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    APPROVAL
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedApproval: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    APPROVAL
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              pendingStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    STAKE PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    {stakeRequest.quantity} XIO FOR {stakeRequest.days}{" "}
                    {stakeRequest.days > 1 ? "DAYS" : "DAY"} TO EARN{" "}
                    <Tooltip
                      title={`${stakeRequest.reward} ${stakeRequest.token}`}
                    >
                      <span>
                        {trunc(stakeRequest.reward)} {stakeRequest.token}
                      </span>
                    </Tooltip>{" "}
                    INSTANTLY
                  </Typography>
                </Fragment>
              ),
              failedStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    STAKE
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    STAKE
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    STAKE
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY STAKED {stakeRequest.quantity} XIO FOR{" "}
                    {stakeRequest.days} {stakeRequest.days > 1 ? "DAYS" : "DAY"}{" "}
                    AND YOU WERE SENT{" "}
                    <Tooltip
                      title={`${stakeRequest.reward} ${stakeRequest.token}`}
                    >
                      <span>
                        {trunc(stakeRequest.reward)} {stakeRequest.token}
                      </span>
                    </Tooltip>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${stakeTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      VIEW ON ETHERSCAN
                    </a>
                  </Typography>
                  <Button variant="red" fullWidth onClick={onClickClose}>
                    CLOSE
                  </Button>
                </Fragment>
              ),
              pendingUnstake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    UNSTAKING{" "}
                    <Tooltip title={`${unstakeRequest.quantity} XIO`}>
                      <span>{trunc(unstakeRequest.quantity)} XIO</span>
                    </Tooltip>
                  </Typography>
                </Fragment>
              ),
              failedUnstake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedUnstake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successUnstake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY UNSTAKED{" "}
                    <Tooltip title={`${unstakeRequest.quantity} XIO`}>
                      <span>{trunc(unstakeRequest.quantity)} XIO</span>
                    </Tooltip>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${stakeTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      VIEW ON ETHERSCAN
                    </a>
                  </Typography>
                  <Button variant="red" fullWidth onClick={onClickClose}>
                    CLOSE
                  </Button>
                </Fragment>
              ),
            }[dialogStep]
          }
        </Dialog>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding },
  web3: { active, account, chainId },
  user: { currentStaked, pools, walletBalance },
  contract,
}) => ({
  ...flashstake,
  loading,
  active,
  expanding,
  account,
  chainId,
  pools,
  currentStaked,
  walletBalance,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIO,
  calculateReward,
  checkAllowanceXIO,
  getBalanceXIO,
  stakeXIO,
  setLoading,
  setDialogStep,
  setReset,
  setInitialValues,
  setRefetch,
  showWalletBackdrop,
  setExpandAccodion,
})(Flashstake);
