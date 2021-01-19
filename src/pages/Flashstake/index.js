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
  MenuItem,
  Select,
} from "@material-ui/core";
// import Select from "@material-ui/core/Select";
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
  changeQuantityRedux,
  rewardPercentage,
} from "../../redux/actions/flashstakeActions";
// import { unstakeEarly } from "../../utils/contractFunctions/flashProtocolContractFunctions";
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
import { store } from "../../config/reduxStore";
import { utils } from "ethers";
import { CONSTANTS } from "../../utils/constants";
import { SlideDown } from "react-slidedown";

let useStyles = makeStyles((theme) => ({
  contentContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-evenly",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    // fontSize: 10,
    marginBottom: theme.spacing(1),
    // [theme.breakpoints.down("xs")]: {
    //   fontSize: 8,
    // },
  },
  selectTokenText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textAlign: "center",
  },
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 500,
  },
  redText: {
    // fontSize: 10,
    fontWeight: 600,
    color: theme.palette.xioRed.main,
  },
  infoText: {
    // fontSize: 10,
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  infoTextSpan: {
    // fontSize: 10,
    fontWeight: 500,
    color: theme.palette.xioRed.main,
    position: "relative",
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary2,
    fontWeight: 500,
  },
  textBold: {
    fontWeight: 500,
  },
  xIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
    marginTop: theme.spacing(4),
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
    borderRadius: theme.palette.ButtonRadius.small,
    boxSizing: "border-box",
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "500 !important",
      padding: theme.spacing(0, 4),
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
    right: "2px",
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
  maxIconButtonTime: {
    position: "absolute",
    left: 2,
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
    fontWeight: 500,
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
      color: theme.palette.xioRed.main,
    },
  },
  accordion: {
    backgroundColor: theme.palette.background.secondary,
  },
  stakeDashBtn: {
    color: "inherit",
    fontWeight: 500,
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
    fontWeight: 500,
  },
  gridSpace: {
    margin: theme.spacing(1, 0),
  },
  // gridSpace4: {
  //   display: "flex",
  //   justifyContent: "center",
  // },
  gridSpace2: {
    marginTop: theme.spacing(1, 0),
  },
  warningText: {
    marginTop: theme.spacing(1),
  },
  gridSpace3: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  select: {
    visibility: "hidden",
    position: "absolute",
  },
  ".MuiSelect-select.MuiSelect-select": {
    display: "none",
  },
  item: {
    "&.MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover": {
      color: `${theme.palette.text.secondary} !important`,
    },
    "&:hover": {
      backgroundColor: `${theme.palette.background.secondary3} !important`,
    },
  },
  timeText: {
    fontWeight: 500,
    color: "#9191A7",
    "&:hover": {
      // background: theme.palette.background.primary,
      color: theme.palette.xioRed.main,

      // "& svg": {
      //   fill: theme.palette.xioRed.main,
      // },
    },
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
  preciseReward,
  loading: loadingRedux,
  active,
  account,
  checkAllowance,
  allowanceXIOProtocol,
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
  changeApp,
  maxDays,
  changeQuantityRedux,
  rewardPercentage,
  poolsApy,
  rewardPercent,
  allPoolsData,
  ...props
}) {
  let classes = useStyles();
  const web3context = useWeb3React();
  const history = useHistory();
  const [height, setHeight] = useState(heightVal);
  const [heightToggle, setHeightToggle] = useState(false);
  const ref = useRef(null);
  const [time, setTime] = useState("Select");
  const [open, setOpen] = useState(false);
  const [_maxDays, _setMaxDays] = useState();

  useEffect(() => {
    // Stop if the preference variable is not set on the client device
    if (localStorage.getItem("prefs-stake-time") == null) return;

    // Determine if we are currently set to the users preference time
    if (time !== localStorage.getItem("prefs-stake-time")) {
      setTime(localStorage.getItem("prefs-stake-time"));
    }
  }, []);

  const handleChange = (event) => {
    setTime(event.target.value);

    // Save this to local storage
    localStorage.setItem("prefs-stake-time", event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  // useEffect(() => {
  //   setTimeout(() => {
  //     // setHeightToggle(!heightToggle);
  //     setHeightValue(ref?.current?.clientHeight);
  //   }, 100);
  // });

  const toggle = () => {
    setHeight(height > 300 ? heightVal : "100%");
  };

  useEffect(() => {
    if (history.location.pathname === "/stake") {
      toggle();
    }
  }, [history.location.pathname]);

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
    changeQuantityRedux(quantity);
  }, [quantity]);

  useEffect(() => {
    // if (rewardPercent.length) {
    // if (!loadingRedux.reward) {
    setTimeout(() => {
      rewardPercentage(quantity, days);
    }, 200);
    // }
    // }
  }, [quantity, days]);

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
    // document.title = "Stake - FLASH | THE TIME TRAVEL OF MONEY";
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
      getMaxTime();
      debouncedCalculateReward(quantity, days, time);
      const _rewardRefreshInterval = setInterval(() => {
        debouncedCalculateReward(quantity, days, time);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [
    setLoading,
    selectedPortal,
    days,
    quantity,
    debouncedCalculateReward,
    time,
  ]);

  useEffect(() => {
    if (active && account) {
      checkAllowance();
      // getBalanceXIO();
      // updateAllBalances();
      showWalletBackdrop(false);
    }
  }, [active, account, chainId]);

  const onClickStake = (quantity, days) => {
    setDialogStep("pendingStake");
    setShowStakeDialog(true);
    stakeXIO(quantity, days, time);
  };

  const onClickApprove = () => {
    setDialogStep("pendingApproval");
    setShowStakeDialog(true);
    getApprovalXIO("stake");
  };

  // useEffect(() => {
  //   unStakeCompleted();
  // }, []);

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
  };

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);

  const getMaxTime = () => {
    const __maxDays = Math.trunc(
      maxDays / (time === "Mins" ? 60 : time === "Hrs" ? 3600 : 86400)
    );

    _setMaxDays(__maxDays);
    return __maxDays;
  };

  useEffect(() => {
    getMaxTime();
  }, [maxDays]);

  const maxDuration = () => {
    setDays(getMaxTime());
  };

  return (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
        {/* <AnimateHeight
          id="example-panel"
          duration={400}
          height={heightVal} // see props documentation below
        > */}

        {/* <SlideDown className={"my-dropdown-slidedown"}> */}
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
              <Grid container xs={12}>
                <Grid item xs={12}>
                  <Typography variant="body1" className={classes.secondaryText}>
                    What token do you want to earn
                  </Typography>
                  <DropdownDialog
                    className={classes.dropDown}
                    pools={pools}
                    selectedValue={selectedRewardToken}
                    onSelect={setSelectedRewardToken}
                    heading="SELECT TOKEN"
                  />
                </Grid>
                <Grid container className={classes.gridSpace} xs={12}>
                  <Grid item xs={5} className={classes.gridSpace}>
                    <Typography
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      Fuel (FLASH)
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
                  </Grid>

                  <Grid
                    item
                    className={`${classes.gridSpace}  ${classes.xAligned}`}
                    xs={2}
                  >
                    <Typography variant="h6" className={classes.xIcon}>
                      x
                    </Typography>
                  </Grid>
                  <Grid item xs={5} className={classes.gridSpace}>
                    <Typography
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      Time ({time})
                    </Typography>

                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        fullWidth
                        placeholder="0"
                        value={days}
                        error={days > _maxDays}
                        onChange={onChangeDays}
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => (e.target.placeholder = "0")}
                      />

                      <IconButton
                        className={classes.maxIconButtonTime}
                        disabled={!(active || account) || _maxDays == days}
                        onClick={maxDuration}
                      >
                        <MaxBtn width={10} />
                      </IconButton>

                      <IconButton
                        className={classes.maxIconButton}
                        // disabled={
                        //   !(active || account) || walletBalance == quantity
                        // }
                        onClick={() => setOpen(true)}
                      >
                        {/* <MaxBtn width={10} /> */}
                        <Typography
                          variant="body2"
                          className={classes.timeText}
                        >
                          {time}
                        </Typography>
                      </IconButton>
                    </Box>
                    <Select
                      labelId="demo-controlled-open-select-label"
                      id="demo-controlled-open-select"
                      open={open}
                      className={classes.select}
                      onClose={handleClose}
                      onOpen={handleOpen}
                      value={time}
                      onChange={handleChange}
                    >
                      {/* <MenuItem className={classes.item} value="">
                          <em>None</em>
                        </MenuItem> */}
                      <MenuItem className={classes.item} value={"Mins"}>
                        Mins
                      </MenuItem>
                      <MenuItem className={classes.item} value={"Hrs"}>
                        Hrs
                      </MenuItem>
                      <MenuItem className={classes.item} value={"Days"}>
                        Days
                      </MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                {parseFloat(quantity) >
                parseFloat(
                  allPoolsData[selectedRewardToken?.id]?.reserveAltAmount
                ) ? (
                  <Grid item className={classes.gridSpace} xs={12}>
                    <Typography
                      variant="body1"
                      className={`${classes.redText}  `}
                    >
                      Insufficient Liquidity
                    </Typography>
                  </Grid>
                ) : (
                  <Grid item className={classes.gridSpace} xs={12}>
                    {selectedRewardToken?.tokenB?.symbol ? (
                      quantity && days > 0 ? (
                        time !== "Select" ? (
                          days > _maxDays ? (
                            <Typography
                              variant="body1"
                              className={`${classes.redText}  `}
                            >
                              Time Duration Limit Exceeded
                            </Typography>
                          ) : (
                            ///////////////////
                            <Typography
                              // variant="overline"
                              variant="body1"
                              className={classes.infoText}
                            >
                              If you stake{" "}
                              <span className={classes.infoTextSpan}>
                                {trunc(quantity) || 0} FLASH{" "}
                              </span>{" "}
                              for{" "}
                              <span className={classes.infoTextSpan}>
                                {trunc(days) || 0}{" "}
                                {time === "Hrs"
                                  ? days > 1
                                    ? "hours"
                                    : "hour"
                                  : time === "Mins"
                                  ? days > 1
                                    ? "Mins"
                                    : "Min"
                                  : time === "Days"
                                  ? days > 1
                                    ? "Days"
                                    : "Day"
                                  : time}
                                {/* {days > 1 ? "hours" : "hour"} */}
                              </span>{" "}
                              {/* YOU WILL IMMEDIATELY{" "} */}
                              you will immediately {/* GET{" "} */}
                              get{" "}
                              {loadingRedux.reward ? (
                                <CircularProgress
                                  size={12}
                                  className={classes.loaderStyle}
                                />
                              ) : quantity > 0 && days > 0 ? (
                                <Tooltip
                                  title={`${utils.formatUnits(
                                    preciseReward.toString(),
                                    selectedRewardToken?.tokenB?.decimals || 18
                                  )} ${
                                    selectedRewardToken?.tokenB?.symbol || ""
                                  }`}
                                >
                                  <span className={classes.infoTextSpan}>
                                    {trunc(
                                      utils.formatUnits(
                                        preciseReward.toString(),
                                        selectedRewardToken?.tokenB?.decimals ||
                                          18
                                      )
                                    )}{" "}
                                    {selectedRewardToken?.tokenB?.symbol || ""}
                                  </span>
                                </Tooltip>
                              ) : (
                                <Fragment>
                                  <span className={classes.infoTextSpan}>
                                    {`0 ${
                                      selectedRewardToken?.tokenB?.symbol || ""
                                    }`}
                                  </span>
                                  {/* with
                                <span className={classes.infoTextSpan}>
                                  `($
                                  {parseFloat(pools.apy).toFixed(2) -
                                    parseInt(pools.apy) >
                                  0
                                    ? parseFloat(pools.apy).toFixed(2)
                                    : parseInt(pools.apy)}
                                  %)`
                                </span> */}
                                </Fragment>
                              )}{" "}
                              {/* {poolsApy[selectedRewardToken.id]
                                ? `at ${
                                    parseFloat(
                                      poolsApy[selectedRewardToken.id]
                                    ).toFixed(2) -
                                      parseInt(
                                        poolsApy[selectedRewardToken.id]
                                      ) >
                                    0
                                      ? parseFloat(
                                          poolsApy[selectedRewardToken.id]
                                        ).toFixed(2)
                                      : parseInt(
                                          poolsApy[selectedRewardToken.id]
                                        )
                                  }% APY`
                                : null} */}
                              {rewardPercent &&
                              rewardPercent[selectedRewardToken.id]
                                ? `at ${trunc(
                                    rewardPercent[selectedRewardToken.id]
                                  )}% yearly`
                                : null}
                            </Typography>
                          )
                        ) : (
                          <Typography
                            variant="body1"
                            className={`${classes.secondaryText} `}
                          >
                            Select time unit to view rewards
                          </Typography>
                        )
                      ) : (
                        <Typography
                          // variant="overline"
                          variant="body1"
                          className={classes.infoText}
                        >
                          <span className={classes.infoTextSpan}>
                            Fuel (FLASH){" "}
                          </span>{" "}
                          and{" "}
                          <span className={classes.infoTextSpan}>
                            Time ({time})
                          </span>{" "}
                          {/* YOU WILL IMMEDIATELY{" "} */}
                          are needed for time travel
                        </Typography>
                      )
                    ) : (
                      <Typography variant="body2" className={classes.redText}>
                        Select a token to view rewards
                      </Typography>
                    )}
                  </Grid>
                )}
                {/* {||
                  allPoolsData[selectedRewardToken?.id]?.reserveFlashAmount <
                    quantityXIO ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" className={classes.redText}>
                        Insufficient Liquidity
                      </Typography>
                    </Grid>
                  ) : null} */}

                {!allowanceXIOProtocol ? (
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
                          !allowanceXIOProtocol && !loadingRedux.approval
                            ? onClickApprove
                            : () => {}
                        }
                        disabled={
                          allowanceXIOProtocol ||
                          !active ||
                          !account ||
                          loadingRedux.reward ||
                          loadingRedux.approval ||
                          chainId !== CONSTANTS.CHAIN_ID
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
                      // style={{ marginBottom: 10 }}
                      className={classes.btnPaddingLeft}
                    >
                      <Button
                        fullWidth
                        variant={
                          !allowanceXIOProtocol ||
                          !active ||
                          !account ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          loadingRedux.stake ||
                          chainId !== CONSTANTS.CHAIN_ID ||
                          reward <= 0 ||
                          (active &&
                            account &&
                            parseFloat(quantity) > parseFloat(walletBalance))
                            ? "red"
                            : "retro"
                        }
                        onClick={
                          !allowanceXIOProtocol
                            ? () => {}
                            : () => onClickStake(quantity, days)
                        }
                        disabled={
                          !allowanceXIOProtocol ||
                          !active ||
                          !account ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          loadingRedux.stake ||
                          chainId !== CONSTANTS.CHAIN_ID ||
                          reward <= 0 ||
                          (active &&
                            account &&
                            parseFloat(quantity) > parseFloat(walletBalance)) ||
                          _maxDays < days ||
                          time === "Select"
                        }
                        loading={loadingRedux.stake}
                      >
                        STAKE
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Fragment>
                    <Grid
                      item
                      className={classes.gridSpace}
                      xs={12}
                      onClick={showWalletHint}
                    >
                      <Button
                        fullWidth
                        variant="retro"
                        // variant={
                        //   !active ||
                        //   !account ||
                        //   !selectedPortal ||
                        //   quantity <= 0 ||
                        //   days <= 0 ||
                        //   loadingRedux.reward ||
                        //   loadingRedux.stake ||
                        //   chainId !== CONSTANTS.CHAIN_ID ||
                        //   reward <= 0 ||
                        //   (active &&
                        //     account &&
                        //     parseFloat(quantity) > parseFloat(walletBalance))
                        //     ? "disable"
                        //     : "retro"
                        // }
                        onClick={
                          !allowanceXIOProtocol
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
                          chainId !== CONSTANTS.CHAIN_ID ||
                          reward <= 0 ||
                          (active &&
                            account &&
                            parseFloat(quantity) > parseFloat(walletBalance)) ||
                          _maxDays < days ||
                          time === "Select"
                        }
                        loading={loadingRedux.stake}
                      >
                        STAKE
                      </Button>
                    </Grid>
                  </Fragment>
                )}

                {!allowanceXIOProtocol &&
                active &&
                account &&
                selectedRewardToken &&
                !loadingRedux.allowance ? (
                  <Grid item className={classes.gridSpace} xs={12}>
                    <Typography
                      // variant="overline"
                      variant="body2"
                      className={`${classes.redText}`}
                    >
                      {/* BEFORE YOU CAN <b>STAKE</b>, YOU MUST{" "}
                        <b>APPROVE FLASH</b> */}
                      Approve <b>FLASH</b> before <b>staking</b>
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
                      // variant="overline"
                      variant="body2"
                      className={`${classes.redText} ${classes.warningText}`}
                    >
                      Connect wallet to stake
                    </Typography>
                  </Grid>
                ) : chainId !== CONSTANTS.CHAIN_ID ||
                  web3context.error instanceof
                    UnsupportedChainIdError ? null : null}
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
              {heightToggle ? (
                <Table
                  onClickUnstake={onClickUnstake}
                  onClickUnstake2={onClickUnstake2}
                  // toggle={toggle}
                  // heightToggle={heightToggle}
                />
              ) : (
                <Table
                  onClickUnstake={onClickUnstake}
                  onClickUnstake2={onClickUnstake2}
                  // toggle={toggle}
                  // heightToggle={heightToggle}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
        {/* </SlideDown> */}
        {/* </AnimateHeight> */}

        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={["APPROVE", "STAKE"]}
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
                      variant="body1"
                      className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                    >
                      If you stake{" "}
                      <span className={classes.infoTextSpan}>
                        {quantity || 0} FLASH{" "}
                      </span>{" "}
                      for{" "}
                      <span className={classes.infoTextSpan}>
                        {trunc(days) || 0}{" "}
                        {time === "Hrs"
                          ? days > 1
                            ? "hours"
                            : "hour"
                          : time === "Mins"
                          ? days > 1
                            ? "Mins"
                            : "Min"
                          : time === "Days"
                          ? days > 1
                            ? "Days"
                            : "Day"
                          : time}
                        {/* {days > 1 ? "hours" : "hour"} */}
                      </span>{" "}
                      you will{" "}
                      <span className={classes.infoTextSpan}>immediately</span>{" "}
                      get{" "}
                      {loadingRedux.preciseReward ? (
                        <CircularProgress
                          size={12}
                          className={classes.loaderStyle}
                        />
                      ) : (
                        <Tooltip
                          title={`${utils.formatUnits(
                            preciseReward.toString(),
                            selectedRewardToken?.tokenB?.decimals || 18
                          )} ${selectedRewardToken?.tokenB?.symbol || ""}`}
                        >
                          <span className={classes.infoTextSpan}>
                            {trunc(
                              utils.formatUnits(
                                preciseReward.toString(),
                                selectedRewardToken?.tokenB?.decimals || 18
                              )
                            )}{" "}
                            {selectedRewardToken?.tokenB?.symbol || ""}
                          </span>
                        </Tooltip>
                      )}{" "}
                      {poolsApy[selectedRewardToken.id]
                        ? `at ${
                            parseFloat(
                              poolsApy[selectedRewardToken.id]
                            ).toFixed(2) -
                              parseInt(poolsApy[selectedRewardToken.id]) >
                            0
                              ? parseFloat(
                                  poolsApy[selectedRewardToken.id]
                                ).toFixed(2)
                              : parseInt(poolsApy[selectedRewardToken.id])
                          }% APY`
                        : null}
                      {/* {poolsApy[selectedRewardToken.id]
                        ? `${trunc(rewardPercent[selectedValue.id])}% yearly`
                        : null} */}
                    </Typography>
                    <Button
                      variant="retro"
                      fullWidth
                      onClick={
                        !allowanceXIOProtocol
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
                        chainId !== CONSTANTS.CHAIN_ID ||
                        reward <= 0 ||
                        (active &&
                          account &&
                          parseFloat(quantity) > parseFloat(walletBalance)) ||
                        time === "Select"
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
                        {/* YOU HAVE SUCCESSFULLY APPROVED */}
                        You have successfully approved
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
                    variant="body1"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    {stakeRequest.quantity} FLASH for {stakeRequest.days}{" "}
                    {/* {stakeRequest.days > 1 ? "hours" : "hour"}  */}{" "}
                    {time === "Hrs"
                      ? days > 1
                        ? "hours"
                        : "hour"
                      : time === "Mins"
                      ? days > 1
                        ? "Mins"
                        : "Min"
                      : time === "Days"
                      ? days > 1
                        ? "Days"
                        : "Day"
                      : time}{" "}
                    to get{" "}
                    <Tooltip
                      title={`${stakeRequest.reward} ${stakeRequest.token}`}
                    >
                      <span>
                        {trunc(
                          utils.formatUnits(
                            preciseReward.toString(),
                            selectedRewardToken?.tokenB?.decimals || 18
                          )
                        )}{" "}
                        {stakeRequest.token}
                      </span>
                    </Tooltip>{" "}
                    instantly
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
                    variant="body1"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    You have successfully staked {stakeRequest.quantity} FLASH
                    for {stakeRequest.days}{" "}
                    {/* {stakeRequest.days > 1 ? "hours" : "hour"}  */}
                    {time === "Hrs"
                      ? days > 1
                        ? "hours"
                        : "hour"
                      : time === "Mins"
                      ? days > 1
                        ? "Mins"
                        : "Min"
                      : time === "Days"
                      ? days > 1
                        ? "Days"
                        : "Day"
                      : time}{" "}
                    and you were sent{" "}
                    <Tooltip
                      title={`${trunc(
                        utils.formatUnits(
                          preciseReward.toString(),
                          selectedRewardToken?.tokenB?.decimals || 18
                        )
                      )} ${stakeRequest.token}`}
                    >
                      <span>
                        {trunc(
                          utils.formatUnits(
                            preciseReward.toString(),
                            selectedRewardToken?.tokenB?.decimals || 18
                          )
                        )}{" "}
                        {stakeRequest.token}
                      </span>
                    </Tooltip>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://etherscan.io/tx/${stakeTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      View on etherscan
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
                    If you unstake{" "}
                    <Tooltip title={`${dappBalance} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(dappBalance)} FLASH
                      </span>
                    </Tooltip>{" "}
                    now, you will receive{" "}
                    <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBalanceWithBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    and burn{" "}
                    <Tooltip title={`${totalBurnAmount} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBurnAmount)} FLASH
                      </span>
                    </Tooltip>{" "}
                    in the process
                  </Typography>
                  <Button variant="retro" fullWidth onClick={unstakeEarly}>
                    CONFIRM UNSTAKE
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
                    You are about to unstake{" "}
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
                  <Button variant="retro" fullWidth onClick={unstakeEarly}>
                    CONFIRM UNSTAKE
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
                    You are about to unstake{" "}
                    <Tooltip title={`${totalBurn.totalXIO} FLASH`}>
                      <span className={classes.redText}>
                        {totalBurn.totalXIO} FLASH
                      </span>
                    </Tooltip>{" "}
                    now, you will receive{" "}
                    <Tooltip
                      title={`${
                        totalBurn.totalXIO - totalBurn.totalBurn
                      } FLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(totalBurn.totalXIO - totalBurn.totalBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    and burn{" "}
                    <Tooltip title={`${totalBurn.totalBurn} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(totalBurn.totalBurn)} FLASH
                      </span>
                    </Tooltip>{" "}
                    in the process
                  </Typography>
                  <Button variant="retro" fullWidth onClick={unstakeEarly}>
                    CONFIRM UNSTAKE
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
                        You are about to unstake{" "}
                        <Tooltip title={`${dappBalance} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(dappBalance)} FLASH
                          </span>
                        </Tooltip>{" "}
                        now, you will receive{" "}
                        <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBalanceWithBurn)} FLASH
                          </span>
                        </Tooltip>{" "}
                        and burn{" "}
                        <Tooltip title={`${totalBurnAmount} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBurnAmount)} FLASH
                          </span>
                        </Tooltip>{" "}
                        in the process
                      </Typography>
                      <Button
                        variant="retro"
                        fullWidth
                        onClick={() => unstakeEarly}
                      >
                        CONFIRM UNSTAKE
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
                        You are about to unstake {trunc(expiredDappBalance)}{" "}
                        FLASH
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Button
                            variant="retro"
                            fullWidth
                            onClick={unstakeXIO}
                          >
                            <Tooltip title={`${expiredDappBalance} FLASH`}>
                              <span>
                                {/* COMPLETED({trunc(expiredDappBalance)} FLASH) */}
                                CONFIRM UNSTAKE
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
                      variant="body1"
                      className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                    >
                      You are about to unstake{" "}
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>{trunc(expiredDappBalance)} FLASH</span>
                      </Tooltip>
                    </Typography>
                    <Button variant="retro" fullWidth onClick={unstakeXIO}>
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>
                          {/* COMPLETED
                          <br />({trunc(expiredDappBalance)} FLASH) */}
                          CONFIRM UNSTAKE
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
                        If you unstake{" "}
                        <Tooltip title={`${dappBalance} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(dappBalance)} FLASH
                          </span>
                        </Tooltip>{" "}
                        now, you will receive{" "}
                        <Tooltip title={`${totalBalanceWithBurn} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBalanceWithBurn)} FLASH
                          </span>
                        </Tooltip>{" "}
                        and burn{" "}
                        <Tooltip title={`${totalBurnAmount} FLASH`}>
                          <span className={classes.redText}>
                            {trunc(totalBurnAmount)} FLASH
                          </span>
                        </Tooltip>{" "}
                        in the process
                      </Typography>
                      <Button
                        variant="retro"
                        fullWidth
                        onClick={() => unstakeEarly}
                      >
                        CONFIRM UNSTAKE
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
                        Which stake would you like to unstake?
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
                                {/* COMPLETED
                                <br />({trunc(expiredDappBalance)} FLASH) */}
                                CONFIRM UNSTAKE
                              </span>
                            </Tooltip>
                          </Button>
                        </Grid>
                        {/* <Grid item xs={6}>
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
                        </Grid> */}
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
                      You are about to unstake{" "}
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>{trunc(expiredDappBalance)} FLASH</span>
                      </Tooltip>
                    </Typography>
                    <Button variant="retro" fullWidth onClick={unstakeXIO}>
                      <Tooltip title={`${expiredDappBalance} FLASH`}>
                        <span>
                          CONFIRM UNSTAKE
                          {/* <br />({trunc(expiredDappBalance)} FLASH) */}
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
                    variant="body1"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    UNSTAKING{" "}
                    {totalBurn?.totalBurn > 0 ? (
                      <Tooltip
                        title={`${
                          totalBurn.totalXIO - totalBurn.totalBurn
                        } FLASH`}
                      >
                        <span>
                          {" "}
                          {trunc(totalBurn.totalXIO - totalBurn.totalBurn)}{" "}
                          FLASH
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`${unstakeRequest.quantity} FLASH`}>
                        <span>{trunc(unstakeRequest.quantity)} FLASH</span>
                      </Tooltip>
                    )}
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
                    variant="body1"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    You successfully unstaked {}
                    {totalBurn?.totalBurn > 0 ? (
                      <Tooltip
                        title={`${
                          totalBurn.totalXIO - totalBurn.totalBurn
                        } FLASH`}
                      >
                        <span>
                          {" "}
                          {trunc(totalBurn.totalXIO - totalBurn.totalBurn)}{" "}
                          FLASH
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title={`${unstakeRequest.quantity} FLASH`}>
                        <span>{trunc(unstakeRequest.quantity)} FLASH</span>
                      </Tooltip>
                    )}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://etherscan.io/tx/${stakeTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      View on etherscan
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
  ui: { loading, expanding, animation, heightVal, changeApp },
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
    poolsApy,
  },
  query: { allPoolsData },
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
  changeApp,
  poolsApy,
  allPoolsData,
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
  changeQuantityRedux,
  rewardPercentage,
})(Flashstake);
