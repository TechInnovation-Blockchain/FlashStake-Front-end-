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
  PoolTable,
} from "../../component";
import {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIO,
  calculateReward,
  checkAllowance,
  getBalanceXIO,
  stakeXIO,
  setPoolDialogStep,
  checkAllowancePool,
  getApprovalXIOPool,
  getApprovalALTPool,
  setInitialValues,
  addTokenLiquidityInPool,
  removeTokenLiquidityInPool,
} from "../../redux/actions/flashstakeActions";
import { setExpandAccodion } from "../../redux/actions/uiActions";
import { debounce } from "../../utils/debounceFunc";
import { trunc } from "../../utils/utilFunc";
import {
  setLoading,
  showWalletBackdrop,
  setHeightValue,
} from "../../redux/actions/uiActions";
import { Link } from "@material-ui/icons";
// import maxbtn from "../../assets/maxbtn.svg";
import { setRefetch } from "../../redux/actions/dashboardActions";
import { useHistory } from "react-router-dom";
import AnimateHeight from "react-animate-height";
import { getQueryData } from "../../redux/actions/queryActions";
import Radio from "@material-ui/core/Radio";
import axios from "axios";
import { setPoolData } from "../../redux/actions/userActions";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-evenly",
  },
  contentContainer2: {
    padding: theme.spacing(4),
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    // height: "200px",
  },
  comingSoon: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
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
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
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
    height: 35,
    transform: "translateY(-50%)",
    background: theme.palette.background.secondary2,

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
    "& .makeStyles-dropdown": {
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
  gridSpace: {
    margin: theme.spacing(1),
  },
  gridSpace2: {
    margin: theme.spacing(1, 0),
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

function Pool({
  animation,
  setHeightValue,
  heightVal,
  getFlashstakeProps,
  stakeTokens,
  rewardTokens,
  selectedStakeToken,
  selectedRewardToken,
  setSelectedStakeToken,
  setSelectedRewardToken,
  selectedPortal,
  allowanceXIO,
  allowanceALT,
  getApprovalXIO,
  getApprovalALT,
  calculateReward,
  reward,
  loading: loadingRedux,
  active,
  account,
  checkAllowancePool,
  getBalanceXIO,
  balanceXIO,
  balanceALT,
  stakeXIO,
  addTokenLiquidityInPool,
  removeTokenLiquidityInPool,
  setLoading,
  dialogStep3,
  setPoolDialogStep,
  stakeRequest,
  unstakeRequest,
  reset,
  // setReset,
  chainId,
  liquidityTxnHash,
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
  updateAllBalances,
  allowanceXIOPool,
  allowanceALTPool,
  getApprovalXIOPool,
  getApprovalALTPool,
  reserveFlashAmount,
  reserveAltAmount,
  walletBalancesPool,
  liquidityRequest,
  withdrawLiquidityTxnHash,
  withdrawLiquidityRequest,
  setPoolData,
  poolData,
  ...props
}) {
  const classes = useStyles();
  const history = useHistory();
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [expanded2, setExpanded2] = useState(true);
  const [days, setDays] = useState(initialValues.days);
  // const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityXIO, setQuantityXIO] = useState("");
  const ref = useRef(null);
  const web3context = useWeb3React();
  const [height, setHeight] = useState(heightVal);

  // {account === "0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F" ? ():()}

  const getData = async () => {
    const res = await axios
      .get("https://leaderboard.xio.app:3010/getReserves")
      .then((res) => {
        setPoolData(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
  }, [selectedPortal]);

  useEffect(() => {
    setTimeout(() => {
      setHeightValue(ref?.current?.clientHeight);
    }, 100);
  });

  const toggle = () => {
    setHeight(height < 300 ? heightVal : "100%");
  };

  useEffect(() => {
    if (history.location.pathname === "/pool") {
      toggle();
    }
  }, [history.location.pathname]);
  // console.log(history.location.pathname);
  useEffect(() => {
    document.title = "Pool - $FLASH | THE TIME TRAVEL OF MONEY";
  }, []);

  // const debouncedUpdateQueryData = useCallback(debounce(getQueryData, 500), []);

  const regex = /^\d*(.(\d{1,18})?)?$/;
  // const [height2, setHeight2] = useState(0);

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

  // useEffect(() => {
  //   quote();
  // }, [selectedPortal]);

  const quote = useCallback(
    async (_amountA, _amountType = "alt") => {
      const { reserveFlashAmount, reserveAltAmount } = await getQueryData(
        selectedPortal
      );

      console.log(
        "reserveFlashAmount , reserveAltAmount",
        reserveFlashAmount,
        reserveAltAmount
      );
      const [_reserveA, _reserveB] =
        _amountType === "alt"
          ? [reserveAltAmount, reserveFlashAmount]
          : [reserveFlashAmount, reserveAltAmount];
      return (_amountA * _reserveB) / _reserveA;
    },
    [selectedPortal]
  );

  const onChangeQuantityAlt = async ({ target: { value } }) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
      setQuantityAlt(value);
      const _val = await quote(value, "alt");
      // if(_val)
      setQuantityXIO(_val);
    }
  };

  const onChangeQuantityXIO = async ({ target: { value } }) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
      setQuantityXIO(value);
      const _val = await quote(value, "xio");
      setQuantityAlt(_val);
    }
  };

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    // setLoading({ dapp: true });
    setRefetch(true);
  }, [setRefetch]);

  // useEffect(() => {
  //   setInitialValues(quantity, days);
  // }, [days, quantity, setInitialValues]);

  useEffect(() => {
    if (reset) {
      updateAllBalances();
    }
  }, [reset]);

  useEffect(() => {
    if (selectedPortal) {
      if (quantityAlt > 0) {
        onChangeQuantityAlt({ target: { value: quantityAlt } });
      } else if (quantityXIO > 0) {
        onChangeQuantityXIO({ target: { value: quantityXIO } });
      }
    }
  }, [selectedPortal]);

  useEffect(() => {
    if (active && account) {
      checkAllowancePool();
      // getBalanceXIO();
      // updateAllBalances();
      showWalletBackdrop(false);
    }
  }, [active, account, selectedRewardToken, allowanceXIOPool]);

  const onClickPool = useCallback(() => {
    setPoolDialogStep("pendingLiquidity");
    setShowStakeDialog(true);
    addTokenLiquidityInPool(quantityAlt, quantityXIO, selectedPortal);
  }, [quantityAlt, quantityXIO, selectedPortal]);

  const onClickApprove = async () => {
    setPoolDialogStep("pendingApproval");
    setShowStakeDialog(true);
    if (!allowanceXIOPool) {
      setPoolDialogStep("pendingApproval");
      await getApprovalXIOPool(1);
    } else if (!allowanceALTPool) {
      setPoolDialogStep("pendingApproval");
      await getApprovalALTPool(selectedRewardToken?.tokenB?.symbol, "pool");
    }
  };

  const onClickApprovePool = async () => {
    setPoolDialogStep("pendingApproval");
    setShowStakeDialog(true);
  };

  const onClickUnstake = () => {
    setPoolDialogStep("pendingWithdrawLiquidity");
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

  // useEffect(() => {
  //   if (quantity !== 0) {
  //     setEth((eth * reserveAltAmount) / reserveFlashAmount);
  //     console.log(eth);
  //   }
  //   if (quantity2 !== 0) {
  //     setXIO((quantity * reserveFlashAmount) / reserveAltAmount);
  //     console.log(xio);
  //   }
  // }, [quantity, reserveFlashAmount, reserveAltAmount]);

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);

  return (
    // account !== "0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F" ? (
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
                  <Grid container className={classes.gridSpace2} item xs={6}>
                    <Box flex={1}>
                      <Typography
                        variant="body2"
                        className={classes.secondaryText}
                      >
                        QUANTITY
                      </Typography>
                      <Box className={classes.textFieldContainer}>
                        {/* <Tooltip title="Hello world" open={true}> */}
                        <TextField
                          className={classes.textField}
                          fullWidth
                          placeholder="0.0"
                          type="number"
                          inputMode="numeric"
                          pattern={regex}
                          onKeyDown={handleKeyDown}
                          onFocus={(e) => (e.target.placeholder = "")}
                          onBlur={(e) => (e.target.placeholder = "0.0")}
                          value={quantityAlt}
                          onChange={onChangeQuantityAlt}
                          error={
                            active &&
                            account &&
                            selectedPortal &&
                            parseFloat(quantityAlt) > parseFloat(balanceALT)
                          }
                        />
                        {/* </Tooltip> */}
                        <IconButton
                          className={classes.maxIconButton}
                          disabled={
                            !(active || account) ||
                            !selectedPortal ||
                            // !walletBalancesPool[selectedPortal] ||
                            balanceALT == quantityAlt
                          }
                          onClick={() =>
                            onChangeQuantityAlt({
                              target: {
                                value: balanceALT,
                              },
                            })
                          }
                        >
                          <MaxBtn width={10} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item className={classes.gridSpace2} xs={6}>
                    <Typography
                      variant="body2"
                      className={classes.secondaryText}
                    >
                      POOL
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
                        variant="body2"
                        className={classes.secondaryText}
                      >
                        AMOUNT OF $FLASH REQUIRED TO POOL
                      </Typography>
                      <Box className={classes.textFieldContainer}>
                        {/* <Tooltip title="Hello world" open={true}> */}
                        <TextField
                          className={classes.textField}
                          fullWidth
                          placeholder="0.0"
                          type="number"
                          inputMode="numeric"
                          pattern={regex}
                          onKeyDown={handleKeyDown}
                          onFocus={(e) => (e.target.placeholder = "")}
                          onBlur={(e) => (e.target.placeholder = "0.0")}
                          value={quantityXIO}
                          onChange={onChangeQuantityXIO}
                          error={
                            active &&
                            account &&
                            parseFloat(quantityXIO) > parseFloat(walletBalance)
                          }
                        />
                        {/* </Tooltip> */}
                        <IconButton
                          className={classes.maxIconButton}
                          disabled={
                            !(active || account) || walletBalance == quantityXIO
                          }
                          onClick={() =>
                            onChangeQuantityXIO({
                              target: { value: walletBalance },
                            })
                          }
                        >
                          <MaxBtn width={10} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item className={classes.gridSpace} xs={12}>
                    {selectedRewardToken?.tokenB?.symbol ? (
                      <Typography variant="body2" className={classes.infoText}>
                        {/* YOU ARE ABOUT TO POOL {quantity} ETH + {quantity2} $FLASH */}
                      </Typography>
                    ) : (
                      <Typography variant="body2" className={classes.redText}>
                        SELECT A POOL TO ADD LIQUIDITY
                      </Typography>
                    )}
                  </Grid>
                  {!allowanceXIOPool || !allowanceALTPool ? (
                    <Grid container item xs={12} onClick={showWalletHint}>
                      <Grid item xs={6} className={classes.btnPaddingRight}>
                        <Button
                          fullWidth
                          variant="retro"
                          onClick={
                            (!allowanceXIOPool || !allowanceALTPool) &&
                            !loadingRedux.approval
                              ? onClickApprove
                              : () => {}
                          }
                          disabled={
                            !selectedPortal ||
                            !active ||
                            !account ||
                            loadingRedux.pool ||
                            loadingRedux.approval ||
                            chainId !== 4
                          }
                          loading={
                            loadingRedux.approval && loadingRedux.approvalXIO
                          }
                        >
                          {loadingRedux.approval && loadingRedux.approvalXIO
                            ? "APPROVING"
                            : !allowanceXIOPool
                            ? `APPROVE ${selectedStakeToken}`
                            : `APPROVE ${
                                selectedRewardToken.tokenB.symbol || ""
                              }`}
                        </Button>
                      </Grid>
                      <Grid item xs={6} className={classes.btnPaddingLeft}>
                        <Button
                          fullWidth
                          variant="retro"
                          onClick={onClickPool}
                          disabled={
                            !active ||
                            !account ||
                            !selectedPortal ||
                            !allowanceXIOPool ||
                            !allowanceALTPool ||
                            quantityXIO <= 0 ||
                            quantityAlt <= 0 ||
                            loadingRedux.pool ||
                            chainId !== 4 ||
                            parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                            parseFloat(quantityXIO) > parseFloat(walletBalance)
                          }
                          loading={loadingRedux.pool}
                        >
                          POOL
                        </Button>
                      </Grid>
                    </Grid>
                  ) : (
                    <Fragment>
                      <Grid container item xs={12} onClick={showWalletHint}>
                        <Button
                          fullWidth
                          variant="retro"
                          onClick={onClickPool}
                          disabled={
                            !active ||
                            !account ||
                            !selectedPortal ||
                            !allowanceXIOPool ||
                            !allowanceALTPool ||
                            quantityXIO <= 0 ||
                            quantityAlt <= 0 ||
                            loadingRedux.pool ||
                            chainId !== 4 ||
                            parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                            parseFloat(quantityXIO) > parseFloat(walletBalance)
                            //  &&
                            // account !==
                            //   "0x425b9dBa4b4a355cc063C5105501797C5F50266B")
                          }
                          loading={loadingRedux.pool}
                        >
                          {/* {account !==
                          "0x425b9dBa4b4a355cc063C5105501797C5F50266B"
                            ? "COMING SOON"
                            : "POOL"} */}
                          POOL
                        </Button>
                      </Grid>
                    </Fragment>
                  )}
                  {!allowanceXIOPool &&
                  active &&
                  account &&
                  selectedRewardToken &&
                  !loadingRedux.allowance ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" className={classes.redText}>
                        BEFORE YOU CAN <b>STAKE</b>, YOU MUST{" "}
                        <b>APPROVE $FLASH</b>
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
                      <Typography variant="body2" className={classes.redText}>
                        CONNECT YOUR WALLET TO STAKE
                      </Typography>
                    </Grid>
                  ) : chainId !== 4 ||
                    web3context.error instanceof UnsupportedChainIdError ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" className={classes.redText}>
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
                  POOL DASHBOARD
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.accordion}>
                <PoolTable
                  onClickUnstake={onClickUnstake}
                  onClickApprovePool={onClickApprovePool}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </AnimateHeight>

        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={[
            "APPROVE $FLASH",
            `APPROVE ${selectedRewardToken?.tokenB?.symbol}`,
            "POOL",
          ]}
          title="POOL"
          onClose={() => setShowStakeDialog(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep3.includes(item)
          )}
          step={dialogStep3}
          stepperShown={
            quantityXIO > 0 && quantityAlt > 0
              ? dialogStep3 === "pendingApproval" ||
                dialogStep3 === "pendingApprovalToken" ||
                dialogStep3 === "poolProposal"
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
              pendingApprovalToken: (
                <Fragment>
                  <Typography variant="body2" className={classes.textBold}>
                    APPROVAL PENDING
                    <br />
                  </Typography>
                  <Button
                    fullWidth
                    variant="retro"
                    onClick={
                      // ?
                      onClickApprove
                      // : () => {}
                    }
                  >
                    APPROVE
                  </Button>
                </Fragment>
              ),
              poolProposal: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    POOOL
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    IF YOU STAKE{" "}
                    <span className={classes.infoTextSpan}>
                      {/* {quantity || 0} $FLASH{" "} */}
                    </span>{" "}
                    FOR{" "}
                    <span className={classes.infoTextSpan}>
                      {days || 0} HOURS
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
                    // onClick={
                    //   !allowanceXIO
                    //     ? () => {}
                    //     : () => onClickPool(quantity, days)
                    // }
                    disabled={
                      !active ||
                      !account ||
                      !selectedPortal ||
                      // quantity <= 0 ||
                      days <= 0 ||
                      loadingRedux.reward ||
                      loadingRedux.stake ||
                      chainId !== 4 ||
                      reward <= 0
                      // ||
                      // (active &&
                      //   account &&
                      //   parseFloat(quantity) > parseFloat(walletBalance))
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
              pendingLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    ADDING{" "}
                    <Tooltip
                      title={`${liquidityRequest.quantityAlt} ${liquidityRequest.altSymbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityAlt)}{" "}
                        {liquidityRequest.altSymbol}
                      </span>
                    </Tooltip>{" "}
                    AND{" "}
                    <Tooltip title={`${liquidityRequest.quantityXIO} $FLASH`}>
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityXIO)} $FLASH
                      </span>
                    </Tooltip>{" "}
                    TO{" "}
                    <span className={classes.redText}>
                      {liquidityRequest.altSymbol} POOL
                    </span>
                  </Typography>
                </Fragment>
              ),
              failedLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY ADDED{" "}
                    <Tooltip
                      title={`${liquidityRequest.quantityAlt} ${liquidityRequest.altSymbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityAlt)}{" "}
                        {liquidityRequest.altSymbol}
                      </span>
                    </Tooltip>{" "}
                    AND{" "}
                    <Tooltip title={`${liquidityRequest.quantityXIO} $FLASH`}>
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityXIO)} $FLASH
                      </span>
                    </Tooltip>{" "}
                    TO{" "}
                    <span className={classes.redText}>
                      {liquidityRequest.altSymbol} POOL
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${liquidityTxnHash}`}
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
              pendingWithdrawLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    WITHDRAW LIQUIDITY PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    WITHDRAWING{" "}
                    <Tooltip
                      title={`${withdrawLiquidityRequest._liquidity} xFLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(withdrawLiquidityRequest._liquidity)} xFLASH
                      </span>
                    </Tooltip>{" "}
                    FROM{" "}
                    <span className={classes.redText}>
                      {withdrawLiquidityRequest._token} POOL
                    </span>
                  </Typography>
                </Fragment>
              ),
              failedWithdrawLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    WITHDRAW LIQUIDITY
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedWithdrawLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    WITHDRAW LIQUIDITY
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successWithdrawLiquidity: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    WITHDRAW LIQUIDITY
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY WITHDRAWN{" "}
                    <Tooltip
                      title={`${withdrawLiquidityRequest._liquidity} xFLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(withdrawLiquidityRequest._liquidity)} xFLASH
                      </span>
                    </Tooltip>{" "}
                    FROM{" "}
                    <span className={classes.redText}>
                      {withdrawLiquidityRequest._token} POOL
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${withdrawLiquidityTxnHash}`}
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
            }[dialogStep3]
          }
        </Dialog>
      </Fragment>
    </PageAnimation>
  );
}
// const mapStateToProps = () => ({ ui: { animation, heightVal } }) => ({
//   animation,
//   heightVal,
// });

// export default connect(mapStateToProps, { setHeightValue })(Pool);

const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding, animation, heightVal },
  web3: { active, account, chainId },
  user: { currentStaked, pools, walletBalance, walletBalancesPool, poolData },
  query: { reserveFlashAmount, reserveAltAmount },
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
  heightVal,
  reserveFlashAmount,
  reserveAltAmount,
  walletBalancesPool,
  poolData,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIOPool,
  getApprovalALTPool,
  calculateReward,
  checkAllowancePool,
  getBalanceXIO,
  stakeXIO,
  addTokenLiquidityInPool,
  removeTokenLiquidityInPool,
  setLoading,
  setPoolDialogStep,
  // setReset,
  setInitialValues,
  setRefetch,
  showWalletBackdrop,
  setExpandAccodion,
  updateAllBalances,
  setHeightValue,
  setPoolData,
})(Pool);
