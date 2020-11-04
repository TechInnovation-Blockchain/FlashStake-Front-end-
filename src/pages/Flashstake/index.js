//#region imports and styling

import React, {
  useEffect,
  useState,
  Fragment,
  useCallback,
  useRef,
} from "react";
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
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import MaxBtn from "../../component/MaxBtn";
import { updateAllBalances } from "../../redux/actions/userActions";
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
  checkAllowance,
  getBalanceXIO,
  stakeXIO,
  setDialogStep,
  // setReset,
  setInitialValues,
  unstakeXIO,
  unstakeEarly,
} from "../../redux/actions/flashstakeActions";
import { setExpandAccodion } from "../../redux/actions/uiActions";
import { debounce } from "../../utils/debounceFunc";
import { trunc } from "../../utils/utilFunc";
import {
  setLoading,
  showWalletBackdrop,
  setHeightValue,
} from "../../redux/actions/uiActions";
import { Link, CheckCircleOutline } from "@material-ui/icons";
// import maxbtn from "../../assets/maxbtn.svg";
import { setRefetch, selectStake } from "../../redux/actions/dashboardActions";
import { useHistory } from "react-router-dom";
import AnimateHeight from "react-animate-height";

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
    color: theme.palette.xioRed.main,
    position: "relative",
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary2,
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
    margin: theme.spacing(0, 2),
    marginLeft: 22,
    // marginLeft: 2,
  },
  checkbox: {
    padding: 0,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  textField: {
    background: theme.palette.background.secondary2,
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: 10,
    boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
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
    background: theme.palette.background.secondary2,
    height: 35,
    "&.Mui-disabled": {
      display: "none",
    },
    "& svg": {
      fill: "#9191A7",
    },
    "&:hover": {
      // background: theme.palette.background.primary,
      background: theme.palette.background.secondary2,

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
    "&.makeStyles-dropdown": {
      backgroundColor: "#000",
    },
  },
  btn: {
    marginTop: theme.spacing(2),
  },
  btn3: {
    backgroundColor: theme.palette.background.secondary,
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
    backgroundColor: theme.palette.background.secondary,
    padding: "0 !important",

    "& .MuiAccordionSummary-content": {
      display: "block",
      margin: 0,
    },
  },
  dashboardAccordian: {
    color: theme.palette.text.grey,
    "&:hover": {
      color: "#c983d4",
    },
  },
  accordion: {
    backgroundColor: theme.palette.background.secondary,
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
  dialogIcon: {
    fontSize: 80,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 700,
  },
  gridSpace: {
    margin: theme.spacing(1, 0),
  },
  gridSpace2: {
    marginTop: theme.spacing(1, 0),
  },
}));

const Accordion = withStyles((theme) => ({
  root: {
    // border: "1px solid rgba(0, 0, 0, .125)",
    backgroundColor: theme.palette.background.primary,
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
}))(MuiAccordion);

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

//#endregion

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
  checkAllowance,
  getBalanceXIO,
  balanceXIO,
  stakeXIO,
  unstakeXIO,
  unstakeEarly,
  setLoading,
  dialogStep,
  setDialogStep,
  stakeRequest,
  unstakeRequest,
  reset,
  dappBalance,
  expiredDappBalance,
  // setReset,
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
  animation,
  updateAllBalances,
  heightVal,
  setHeightValue,
  totalBurnAmount,
  totalBalanceWithBurn,
  selectedStakes,
  selectStake,
  stakes,
  totalBurn,
  ...props
}) {
  const classes = useStyles();
  const web3context = useWeb3React();
  // console.log(props);
  const history = useHistory();
  const [height, setHeight] = useState(heightVal);
  const ref = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      setHeightValue(ref?.current?.clientHeight);
    }, 100);
  });

  const toggle = () => {
    setHeight(height > 300 ? heightVal : "100%");
  };

  useEffect(() => {
    if (history.location.pathname === "/stake") {
      toggle();
    }
  }, [history.location.pathname]);
  // console.log(history.location.pathname);

  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [expanded2, setExpanded2] = useState(true);

  const debouncedCalculateReward = useCallback(
    debounce(calculateReward, 500),
    []
  );

  const [days, setDays] = useState(initialValues.days);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const regex = /^\d*(.(\d{1,18})?)?$/;

  useEffect(() => {
    document
      .querySelector("input[type='number']")
      .addEventListener("keypress", (evt) => {
        if (evt.which === 8) {
          return;
        }
        if (evt.which === 46) {
          return;
        }
        if (evt.which < 48 || evt.which > 57) {
          evt.preventDefault();
        }
      });
  }, []);

  const onChangeDays = ({ target: { value } }) => {
    if (/^[0-9]*$/.test(value)) {
      setDays(value);
    }
  };
  const onChangeQuantity = ({ target: { value } }) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
      setQuantity(value);
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

  useEffect(() => {
    setInitialValues(quantity, days);
  }, [days, quantity, setInitialValues]);

  useEffect(() => {
    if (reset) {
      // getBalanceXIO();
      updateAllBalances();
      // setReset(false);
    }
  }, [reset, getBalanceXIO]);

  useEffect(() => {
    if (selectedPortal) {
      debouncedCalculateReward(quantity, days);
      const _rewardRefreshInterval = setInterval(() => {
        debouncedCalculateReward(quantity, days);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [setLoading, selectedPortal, days, quantity, debouncedCalculateReward]);

  useEffect(() => {
    if (active && account) {
      // checkAllowance();
      // getBalanceXIO();
      // updateAllBalances();
      showWalletBackdrop(false);
    }
  }, [active, account]);

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

  // useEffect(() => {
  //   unStakeCompleted();
  // }, []);

  // console.log(selectStake);
  const onClickUnstake = () => {
    setDialogStep("unstakeOptions");
    // setDialogStep("pendingUnstake");
    setShowStakeDialog(true);
  };

  const onClickUnstake2 = () => {
    if (totalBurn.totalBurn > 0) {
      setDialogStep("partialCompleted");
      // setDialogStep("pendingUnstake");
    } else {
      setDialogStep("completedStakes");
      // setDialogStep("pendingUnstake");
    }
    setShowStakeDialog(true);
  };

  const onClickClose = () => {
    // setReset(true);
    setShowStakeDialog(false);
  };

  const closeDialog = () => {
    setShowStakeDialog(false);
  };

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
    // console.log(evt.which);
  };

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);

  // const unStakeCompleted = (
  //   id = "0xd6d994e37e69bef5c43fb28d20930eb12baaa6ce4ce23a1a50917bf00f80bca9"
  // ) => {
  //   if (selectedStakes[id]) {
  //     console.log("Exists....");
  //     if (id in stakes) {
  //       console.log("Stake Exists");
  //     }
  //   }
  // };

  // props.history.location.pathname === "/swap" ? true :

  return (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
        <AnimateHeight
          id="example-panel"
          duration={400}
          height={heightVal} // see props documentation below
        >
          <Box
            ref={ref}
            className={`${classes.contentContainer} contentContainer1`}
          >
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
                      variant="body2"
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
                  <Grid container className={classes.gridSpace} item xs={12}>
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        className={classes.secondaryText}
                      >
                        FUEL
                      </Typography>
                      <Box className={classes.textFieldContainer}>
                        {/* <Tooltip title="Hello world" open={true}> */}
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
                        {/* </Tooltip> */}
                        <IconButton
                          className={classes.maxIconButton}
                          disabled={
                            !(active || account) || walletBalance == quantity
                          }
                          onClick={() =>
                            onChangeQuantity({
                              target: { value: walletBalance },
                            })
                          }
                        >
                          <MaxBtn width={10} />
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography variant="h6" className={classes.xIcon}>
                      x
                    </Typography>
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        className={classes.secondaryText}
                      >
                        TIME
                      </Typography>

                      <Box className={classes.textFieldContainer}>
                        <TextField
                          className={classes.textField}
                          fullWidth
                          placeholder="0"
                          value={days}
                          onChange={onChangeDays}
                          type="tel"
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
                      <Typography
                        variant="overline"
                        className={classes.infoText}
                      >
                        IF YOU STAKE{" "}
                        <span className={classes.infoTextSpan}>
                          {trunc(quantity) || 0} FLASH{" "}
                        </span>{" "}
                        FOR{" "}
                        <span className={classes.infoTextSpan}>
                          {trunc(days) || 0} {days > 1 ? "MINUTES" : "MINUTE"}
                        </span>{" "}
                        YOU WILL IMMEDIATELY{" "}
                        {/* <span className={classes.infoTextSpan}></span>{" "} */}
                        GET{" "}
                        {loadingRedux.reward ? (
                          <CircularProgress
                            size={12}
                            className={classes.loaderStyle}
                          />
                        ) : quantity > 0 && days > 0 ? (
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
                        ) : (
                          <span className={classes.infoTextSpan}>
                            {`0 ${selectedRewardToken?.tokenB?.symbol || ""}`}
                          </span>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="body2" className={classes.redText}>
                        SELECT A TOKEN TO VIEW REWARDS
                      </Typography>
                    )}
                  </Grid>

                  {!allowanceXIO ? (
                    <Grid
                      container
                      className={classes.gridSpace}
                      item
                      xs={12}
                      onClick={showWalletHint}
                    >
                      <Grid item xs={6} className={classes.btnPaddingRight}>
                        <Button
                          fullWidth
                          variant="retro"
                          onClick={
                            !allowanceXIO && !loadingRedux.approval
                              ? onClickApprove
                              : () => {}
                          }
                          disabled={
                            allowanceXIO ||
                            !active ||
                            !account ||
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
                      <Grid
                        item
                        xs={6}
                        style={{ marginBottom: 10 }}
                        className={classes.btnPaddingLeft}
                      >
                        <Button
                          fullWidth
                          variant="retro"
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
                          variant="retro"
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
                      <Typography
                        variant="overline"
                        className={classes.redText}
                      >
                        BEFORE YOU CAN <b>STAKE</b>, YOU MUST{" "}
                        <b>APPROVE FLASH</b>
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
                      <Typography
                        variant="overline"
                        className={classes.redText}
                      >
                        CONNECT YOUR WALLET TO STAKE
                      </Typography>
                    </Grid>
                  ) : chainId !== 4 ||
                    web3context.error instanceof UnsupportedChainIdError ? (
                    <Grid item xs={12}>
                      <Typography
                        variant="overline"
                        className={classes.redText}
                      >
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
                <Table
                  onClickUnstake={onClickUnstake}
                  onClickUnstake2={onClickUnstake2}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </AnimateHeight>

        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={["APPROVE FLASH", "STAKE"]}
          title="FLASHSTAKE"
          onClose={() => setShowStakeDialog(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep.includes(item)
          )}
          step={dialogStep}
          stepperShown={
            quantity > 0 && days > 0
              ? dialogStep === "pendingApproval" ||
                dialogStep === "flashstakeProposal"
              : null
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
          //    <Button variant="retro" fullWidth onClick={onClickClose}>
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
              flashstakeProposal:
                quantity > 0 && days > 0 ? (
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
                        {quantity || 0} FLASH{" "}
                      </span>{" "}
                      FOR{" "}
                      <span className={classes.infoTextSpan}>
                        {days || 0} MINS
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
                      variant="retro"
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
                ) : (
                  <Fragment>
                    <Typography variant="body1" className={classes.textBold}>
                      APPROVAL
                      <br />
                      <CheckCircleOutline
                        className={`${classes.dialogIcon} ${classes.greenText}`}
                      />
                      <div className={classes.redText}>
                        YOU HAVE SUCCESSFUL APPROVED
                      </div>
                    </Typography>
                    <Button variant="retro" fullWidth onClick={closeDialog}>
                      DISMISS
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                    {stakeRequest.quantity} FLASH FOR {stakeRequest.days}{" "}
                    {stakeRequest.days > 1 ? "MINS" : "MIN"} TO EARN{" "}
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                    YOU HAVE SUCCESSFULLY STAKED {stakeRequest.quantity} FLASH
                    FOR {stakeRequest.days}{" "}
                    {stakeRequest.days > 1 ? "MINS" : "MIN"} AND YOU WERE SENT{" "}
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
                  <Button variant="retro" fullWidth onClick={onClickClose}>
                    CLOSE
                  </Button>
                </Fragment>
              ),
              earlyUnstakeFull: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    IF YOU UNSTAKE{" "}
                    <Tooltip title={`${dappBalance} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(dappBalance)} FLASH
                      </span>
                    </Tooltip>{" "}
                    NOW, YOU WILL RECIEVE{" "}
                    <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBalanceWithBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    AND BURN{" "}
                    <Tooltip title={`${totalBurnAmount} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBurnAmount)} FLASH
                      </span>
                    </Tooltip>{" "}
                    IN THE PROCESS
                  </Typography>
                  <Button variant="retro" fullWidth onClick={unstakeEarly}>
                    UNSTAKE
                  </Button>
                </Fragment>
              ),
              completedStakes: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU ARE ABOUT TO UNSTAKE{" "}
                    <Tooltip title={`${totalBurn.totalXIO} FLASH`}>
                      <span className={classes.redText}>
                        {totalBurn.totalXIO} FLASH
                      </span>
                    </Tooltip>{" "}
                    {/* NOW, YOU WILL RECIEVE{" "}
                    <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBalanceWithBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    AND BURN{" "}
                    <Tooltip title={`${totalBurnAmount} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBurnAmount)} FLASH
                      </span>
                    </Tooltip>{" "}
                    IN THE PROCESS*/}
                  </Typography>
                  <Button
                    variant="retro"
                    fullWidth
                    onClick={() => unstakeEarly(false)}
                  >
                    UNSTAKE
                  </Button>
                </Fragment>
              ),

              partialCompleted: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    UNSTAKE
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU ARE ABOUT TO UNSTAKE{" "}
                    <Tooltip title={`${totalBurn.totalXIO} FLASH`}>
                      <span className={classes.redText}>
                        {totalBurn.totalXIO} FLASH
                      </span>
                    </Tooltip>{" "}
                    NOW, YOU WILL RECIEVE{" "}
                    <Tooltip
                      title={`${
                        totalBurn.totalXIO - totalBurn.totalBurn
                      } FLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(totalBurn.totalXIO - totalBurn.totalBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    AND BURN{" "}
                    <Tooltip title={`${totalBurn.totalBurn} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBurn.totalBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    IN THE PROCESS
                  </Typography>
                  <Button
                    variant="retro"
                    fullWidth
                    onClick={() => unstakeEarly(false)}
                  >
                    UNSTAKE
                  </Button>
                </Fragment>
              ),

              unstakeOptions:
                parseFloat(dappBalance) > parseFloat(expiredDappBalance) ? (
                  parseFloat(expiredDappBalance) === 0 ? (
                    //If no stakes have completed yet
                    <Fragment>
                      <Typography variant="body1" className={classes.textBold}>
                        UNSTAKE
                        <br />
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                      >
                        YOU ARE ABOUT TO UNSTAKE{" "}
                        <Tooltip title={`${dappBalance} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(dappBalance)} FLASH
                          </span>
                        </Tooltip>{" "}
                        NOW, YOU WILL RECIEVE{" "}
                        <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBalanceWithBurn)} FLASH
                          </span>
                        </Tooltip>{" "}
                        AND BURN{" "}
                        <Tooltip title={`${totalBurnAmount} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBurnAmount)} FLASH
                          </span>
                        </Tooltip>{" "}
                        IN THE PROCESS
                      </Typography>
                      <Button variant="retro" fullWidth onClick={unstakeEarly}>
                        UNSTAKE
                      </Button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Typography variant="body1" className={classes.textBold}>
                        UNSTAKE
                        <br />
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                      >
                        WHICH STAKES WOULD YOU LIKE TO UNSTAKE?
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            variant="retro"
                            fullWidth
                            onClick={unstakeXIO}
                          >
                            <Tooltip title={`${expiredDappBalance} FLASH`}>
                              <span>
                                COMPLETED
                                <br />({trunc(expiredDappBalance)} FLASH)
                              </span>
                            </Tooltip>
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="retro"
                            fullWidth
                            onClick={() => setDialogStep("earlyUnstakeFull")}
                          >
                            <Tooltip title={`${dappBalance} FLASH`}>
                              <span>
                                ALL
                                <br />({trunc(dappBalance)} FLASH)
                              </span>
                            </Tooltip>
                          </Button>
                        </Grid>
                      </Grid>
                    </Fragment>
                  )
                ) : (
                  <Fragment>
                    <Typography variant="body1" className={classes.textBold}>
                      UNSTAKE
                      <br />
                    </Typography>
                    <Typography
                      variant="body2"
                      className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                    >
                      YOU ARE ABOUT TO UNSTAKE{" "}
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>{trunc(expiredDappBalance)} FLASH</span>
                      </Tooltip>
                    </Typography>
                    <Button variant="retro" fullWidth onClick={unstakeXIO}>
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>
                          COMPLETED
                          <br />({trunc(expiredDappBalance)} FLASH)
                        </span>
                      </Tooltip>
                    </Button>
                  </Fragment>
                ),
              unstakeSelectedOptions:
                parseFloat(dappBalance) > parseFloat(expiredDappBalance) ? (
                  parseFloat(expiredDappBalance) === 0 ? (
                    //If no stakes have completed yet
                    <Fragment>
                      <Typography variant="body1" className={classes.textBold}>
                        UNSTAKE
                        <br />
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                      >
                        IF YOU UNSTAKE{" "}
                        <Tooltip title={`${dappBalance} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(dappBalance)} FLASH
                          </span>
                        </Tooltip>{" "}
                        NOW, YOU WILL RECIEVE{" "}
                        <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBalanceWithBurn)} FLASH
                          </span>
                        </Tooltip>{" "}
                        AND BURN{" "}
                        <Tooltip title={`${totalBurnAmount} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBurnAmount)} FLASH
                          </span>
                        </Tooltip>{" "}
                        IN THE PROCESS
                      </Typography>
                      <Button
                        variant="retro"
                        fullWidth
                        onClick={() => unstakeEarly(false)}
                      >
                        UNSTAKE
                      </Button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Typography variant="body1" className={classes.textBold}>
                        UNSTAKE
                        <br />
                      </Typography>
                      <Typography
                        variant="body2"
                        className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                      >
                        WHICH STAKES WOULD YOU LIKE TO UNSTAKE?
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Button
                            variant="retro"
                            fullWidth
                            onClick={unstakeXIO}
                          >
                            <Tooltip title={`${expiredDappBalance} FLASH`}>
                              <span>
                                COMPLETED
                                <br />({trunc(expiredDappBalance)} FLASH)
                              </span>
                            </Tooltip>
                          </Button>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            variant="retro"
                            fullWidth
                            onClick={() => setDialogStep("earlyUnstakeFull")}
                          >
                            <Tooltip title={`${dappBalance} FLASH`}>
                              <span>
                                ALL
                                <br />({trunc(dappBalance)} FLASH)
                              </span>
                            </Tooltip>
                          </Button>
                        </Grid>
                      </Grid>
                    </Fragment>
                  )
                ) : (
                  <Fragment>
                    <Typography variant="body1" className={classes.textBold}>
                      UNSTAKE
                      <br />
                    </Typography>
                    <Typography
                      variant="body2"
                      className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                    >
                      YOU ARE ABOUT TO UNSTAKE{" "}
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>{trunc(expiredDappBalance)} FLASH</span>
                      </Tooltip>
                    </Typography>
                    <Button variant="retro" fullWidth onClick={unstakeXIO}>
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>
                          COMPLETED
                          <br />({trunc(expiredDappBalance)} FLASH)
                        </span>
                      </Tooltip>
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
                    <Tooltip title={`${unstakeRequest.quantity} FLASH`}>
                      <span>{trunc(unstakeRequest.quantity)} FLASH</span>
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                  <Button variant="retro" fullWidth onClick={closeDialog}>
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
                    <Tooltip title={`${unstakeRequest.quantity} FLASH`}>
                      <span>{trunc(unstakeRequest.quantity)} FLASH</span>
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
                  <Button variant="retro" fullWidth onClick={onClickClose}>
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
  ui: { loading, expanding, animation, heightVal },
  web3: { active, account, chainId },
  dashboard: { selectedStakes, isStakesSelected, totalBurn },
  user: {
    currentStaked,
    stakes,
    pools,
    walletBalance,
    dappBalance,
    expiredDappBalance,
    totalBurnAmount,
    totalBalanceWithBurn,
    expired,
  },
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
  animation,
  dappBalance,
  expiredDappBalance,
  heightVal,
  totalBurnAmount,
  totalBalanceWithBurn,
  selectedStakes,
  stakes,
  totalBurn,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIO,
  calculateReward,
  checkAllowance,
  getBalanceXIO,
  stakeXIO,
  setLoading,
  setDialogStep,
  // setReset,
  setInitialValues,
  setRefetch,
  showWalletBackdrop,
  setExpandAccodion,
  updateAllBalances,
  setHeightValue,
  unstakeEarly,
  unstakeXIO,
  selectStake,
})(Flashstake);
