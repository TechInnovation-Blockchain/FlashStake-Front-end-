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
import AddDropDown from "../../component/AddDropDown";
import {
  setSelectedStakeToken,
  setSelectedRewardToken,
  calculateReward,
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
import { JSBI } from "@uniswap/sdk";
import { _error } from "../../utils/log";
import { utils } from "ethers";
import { CONSTANTS } from "../../utils/constants";
import Fade from "@material-ui/core/Fade";

import { SlideDown } from "react-slidedown";

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
    fontWeight: 500,
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
  secondaryText2: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textAlign: "center",
    width: "100%",
    padding: theme.spacing(1, 0),
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
    fontWeight: 500,
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
    boxSizing: "border-box",
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "500 !important",
      padding: theme.spacing(0, 1),
      lineHeight: 1.5,
      textAlign: "center",
    },
    "& .Mui-error": {
      color: theme.palette.xioRed.main,
    },
  },
  headingBox: {
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.border.secondary}`,
  },
  mainHeading: {
    fontWeight: 500,
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
    right: "5px",
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
  liquidityText: {},
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
  gridSpace: {
    margin: theme.spacing(1),
  },
  gridSpace2: {
    margin: theme.spacing(1, 0),
  },
  outerBox: {
    backgroundColor: theme.palette.background.secondary,
    borderRadius: 5,
    padding: theme.spacing(1),
    height: "100%",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  outerBox2: {
    display: "flex",
    width: "100%",
  },

  outerBoxHeading: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
  },
  innerBox2: {
    width: "100%",
    margin: theme.spacing(0.5, 0),
    fontWeight: 500,
  },
  innerText2: {
    textAlign: "left",
  },
  outerBG: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 10,
    margin: theme.spacing(1),
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
  theme,
  allPoolsData,
  poolDashboard,
  ...props
}) {
  const classes = useStyles();
  const history = useHistory();
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showStakeDialog2, setShowStakeDialog2] = useState(false);
  const [expanded2, setExpanded2] = useState(true);

  const [poolsLiquidityList, setPoolsLiquidityList] = useState([]);
  const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityXIO, setQuantityXIO] = useState("");
  const ref = useRef(null);
  const web3context = useWeb3React();
  const [height, setHeight] = useState(heightVal);
  const [queryData, setQueryData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPool, setCurrentPool] = useState({});

  const importTokenFunc = () => {
    // setExpanded2(true);
    setOpenDialog(true);
  };

  const toggle = () => {
    setHeight(height < 300 ? heightVal : "100%");
  };

  useEffect(() => {
    setPoolsLiquidityList(
      poolDashboard.map((_pool) => {
        const poolQueryData = allPoolsData[_pool.pool.id];
        let _percentageShare = 0;
        let pooledFlash = 0;
        let pooledAlt = 0;
        if (poolQueryData) {
          _percentageShare =
            _pool.balance /
            utils.formatUnits(poolQueryData.poolTotalSupply.toString(), 18);
          pooledFlash =
            _percentageShare *
            utils.formatUnits(poolQueryData.reserveFlashAmount.toString(), 18);
          pooledAlt =
            _percentageShare *
            utils.formatUnits(
              poolQueryData.reserveAltAmount.toString(),
              _pool?.pool?.tokenB?.decimal
            );
        }
        return {
          ..._pool,
          poolQueryData,
          pooledFlash,
          pooledAlt,
          poolShare: _percentageShare * 100,
        };
      })
    );
  }, [poolDashboard, allPoolsData]);
  useEffect(() => {
    if (selectedRewardToken?.id) {
      const _pool = poolsLiquidityList.find(
        (__pool) => __pool.pool.id === selectedRewardToken.id
      );
      setCurrentPool(_pool || { currentPool: selectedRewardToken });
    }
  }, [selectedRewardToken, poolsLiquidityList]);

  useEffect(() => {
    if (history.location.pathname === "/pool") {
      toggle();
    }
  }, [history.location.pathname]);
  useEffect(() => {
    document.title = "Pool - FLASH | THE TIME TRAVEL OF MONEY";
  }, []);

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

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);

  const fetchQueryData = async () => {
    const _queryData = await getQueryData(selectedPortal);
    setQueryData(_queryData || {});
  };

  useEffect(() => {
    if (selectedPortal) {
      fetchQueryData();
    }
  }, [selectedPortal]);

  const quote = useCallback(
    async (_amountA, _amountType = "alt") => {
      try {
        const _queryData = await getQueryData(selectedPortal);
        const { reserveFlashAmount, reserveAltAmount } = _queryData;
        if (reserveFlashAmount <= 0 && reserveAltAmount <= 0) {
          return true;
        }
        const [_reserveA, _reserveB] =
          _amountType === "alt"
            ? [reserveAltAmount, reserveFlashAmount]
            : [reserveFlashAmount, reserveAltAmount];

        /////////////////////////////////////////
        return utils.formatUnits(
          String(
            JSBI.divide(
              JSBI.multiply(
                JSBI.BigInt(
                  utils.parseUnits(
                    _amountA?.toString(),
                    selectedRewardToken?.tokenB?.decimal
                  )
                ),
                JSBI.BigInt(_reserveB)
              ),
              JSBI.BigInt(_reserveA)
            )
          ),
          selectedRewardToken?.tokenB?.decimal
        );
      } catch (e) {
        _error("ERROR quote Pool -> ", e);
        return 0;
      }
    },
    [selectedPortal]
  );

  const onChangeQuantityAlt = useCallback(
    async ({ target: { value } }) => {
      if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
        setQuantityAlt(value);
        const _val = selectedRewardToken?.id ? await quote(value, "alt") : "0";
        if (typeof _val !== "boolean") {
          setQuantityXIO(_val);
        }
      }
    },
    [selectedRewardToken]
  );

  const onChangeQuantityXIO = useCallback(
    async ({ target: { value } }) => {
      if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
        setQuantityXIO(value);
        const _val = selectedRewardToken?.id ? await quote(value, "xio") : "0";
        if (typeof _val !== "boolean") {
          setQuantityAlt(_val);
        }
      }
    },
    [selectedRewardToken]
  );

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

  // const onClickPool = () => {
  //  return <AddDropDown
  //     quantityAlt={quantityAlt}
  //     quantityXIO={quantityXIO}
  //     selectedRewardToken={selectedRewardToken}
  //     queryData={queryData}
  //     disabled={
  //       !active ||
  //       !account ||
  //       !selectedPortal ||
  //       !allowanceXIOPool ||
  //       !allowanceALTPool ||
  //       quantityXIO <= 0 ||
  //       quantityAlt <= 0 ||
  //       loadingRedux.pool ||
  //       chainId !== CONSTANTS.CHAIN_ID ||
  //       parseFloat(quantityAlt) > parseFloat(balanceALT) ||
  //       parseFloat(quantityXIO) > parseFloat(walletBalance)
  //     }
  //     onClickPool={onClickPool}
  //   />;
  // };

  const onClickPool = useCallback(
    (_quantityAlt, _quantityXIO) => {
      setPoolDialogStep("pendingLiquidity");
      setShowStakeDialog(true);
      if (Number(_quantityAlt) && Number(_quantityXIO)) {
        addTokenLiquidityInPool(_quantityAlt, _quantityXIO, selectedPortal);
      } else {
        addTokenLiquidityInPool(quantityAlt, quantityXIO, selectedPortal);
      }
    },
    [quantityAlt, quantityXIO, selectedPortal]
  );

  const onClickApprove = async () => {
    setPoolDialogStep("pendingApproval");
    setShowStakeDialog(true);
    if (!allowanceXIOPool) {
      setPoolDialogStep("pendingApproval");
      await getApprovalXIOPool();
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
  };

  return (
    // account !== "0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F" ? (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
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
              <Grid container spacing={2}>
                <Grid container className={classes.gridSpace2} item xs={6}>
                  <Box flex={1}>
                    <Typography
                      // variant="body2"
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      {/* QUANTITY */}
                      Quantity
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
                    // variant="body2"
                    variant="body1"
                    className={classes.secondaryText}
                  >
                    Pool
                  </Typography>
                  <DropdownDialog
                    className={classes.dropDown}
                    items={pools}
                    selectedValue={selectedRewardToken}
                    onSelect={setSelectedRewardToken}
                    heading="SELECT TOKEN"
                    _theme={theme}
                    overrideOpen={true}
                    openProp={openDialog}
                    setOpenProp={setOpenDialog}
                  />
                </Grid>

                <Grid container item xs={12}>
                  <Box flex={1}>
                    <Typography
                      // variant="body2"
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      {/* AMOUNT OF FLASH REQUIRED TO POOL */}
                      Amount of FLASH required to pool
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

                {selectedRewardToken?.tokenB?.symbol ? (
                  <Fragment>
                    <Grid item xs={4}>
                      <Box flex={1} className={classes.outerBox}>
                        <Typography
                          // variant="body2"
                          variant="body2"
                          className={classes.secondaryText}
                        >
                          {/* AMOUNT OF FLASH REQUIRED TO POOL */}
                          FLASH per {selectedRewardToken?.tokenB?.symbol}
                        </Typography>
                        <Tooltip
                          title={
                            queryData.reserveFlashAmount /
                              queryData.reserveAltAmount || 0
                          }
                        >
                          <Typography
                            variant="body1"
                            className={classes.secondaryText}
                          >
                            {trunc(
                              queryData.reserveFlashAmount /
                                queryData.reserveAltAmount
                            ) || 0}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Grid>

                    <Grid item xs={4}>
                      <Box flex={1} className={classes.outerBox}>
                        <Typography
                          // variant="body2"
                          variant="body2"
                          className={classes.secondaryText}
                        >
                          {selectedRewardToken?.tokenB?.symbol} per FLASH
                        </Typography>

                        <Tooltip
                          title={
                            queryData.reserveAltAmount /
                              queryData.reserveFlashAmount || 0
                          }
                        >
                          <Typography
                            variant="body1"
                            className={classes.secondaryText}
                          >
                            {trunc(
                              queryData.reserveAltAmount /
                                queryData.reserveFlashAmount
                            ) || 0}
                          </Typography>
                        </Tooltip>
                        {/* <Box className={classes.textFieldContainer}></Box> */}
                      </Box>
                    </Grid>

                    <Grid item xs={4}>
                      <Box flex={1} className={classes.outerBox}>
                        <Typography
                          // variant="body2"
                          variant="body2"
                          className={classes.secondaryText}
                        >
                          Share of Pool
                        </Typography>
                        <Tooltip
                          title={`${
                            (quantityXIO /
                              (parseFloat(quantityXIO) +
                                parseFloat(
                                  utils.formatUnits(
                                    queryData?.reserveFlashAmount?.toString() ||
                                      "0",
                                    selectedRewardToken?.tokenB?.decimal
                                  )
                                ))) *
                              100 || 0
                          }%`}
                        >
                          <Typography
                            variant="body1"
                            className={classes.secondaryText}
                          >
                            {trunc(
                              (quantityXIO /
                                (parseFloat(quantityXIO) +
                                  parseFloat(
                                    utils.formatUnits(
                                      queryData?.reserveFlashAmount?.toString() ||
                                        "0",
                                      selectedRewardToken?.tokenB?.decimal
                                    )
                                  ))) *
                                100
                            ) || 0}
                            %
                          </Typography>
                        </Tooltip>
                        {/* <Box className={classes.textFieldContainer}></Box> */}
                      </Box>
                    </Grid>
                  </Fragment>
                ) : null}

                {selectedRewardToken?.id ? (
                  poolsLiquidityList.find(
                    (__pool) => __pool.pool.id === selectedRewardToken.id
                  ) ? (
                    <Fragment>
                      <Grid container className={classes.outerBG}>
                        <Grid xs={12} item className={classes.outerBoxHeading}>
                          <Box className={classes.headingBox}>
                            <Typography className={classes.mainHeading}>
                              YOUR POSITION
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid xs={12} item className={classes.outerBox2}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox2}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Your total pool tokens:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={currentPool?.balance || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(currentPool?.balance || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} item className={classes.outerBox2}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox2}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Pooled FLASH:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={currentPool.pooledFlash || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(currentPool.pooledFlash || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} item className={classes.outerBox2}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox2}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Pooled {currentPool?.pool?.tokenB?.symbol}:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={currentPool.pooledAlt || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(currentPool.pooledAlt || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} item className={classes.outerBox2}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox2}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Your pool share:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={`${currentPool.poolShare || 0}%`}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(currentPool.poolShare || 0)}%
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Fragment>
                  ) : (
                    <Grid xs={12} item className={classes.liquidityText}>
                      <Typography
                        variant="body1"
                        // variant="body2"
                        className={classes.redText}
                        // style={{ textAlign: "center" }}
                      >
                        You are the first liquidity provider for this pool. The
                        ratio of tokens you add will set the price. Please
                        proceed carefully.
                      </Typography>
                    </Grid>
                  )
                ) : null}

                {!selectedRewardToken?.tokenB?.symbol ? (
                  <Typography
                    variant="body1"
                    // variant="body2"
                    className={classes.secondaryText2}
                  >
                    Select a pool to add liquidity
                  </Typography>
                ) : null}

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
                          chainId !== CONSTANTS.CHAIN_ID
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
                              selectedRewardToken?.tokenB?.symbol || ""
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
                          chainId !== CONSTANTS.CHAIN_ID ||
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
                      <AddDropDown
                        quantityAlt={quantityAlt}
                        quantityXIO={quantityXIO}
                        selectedRewardToken={selectedRewardToken}
                        queryData={queryData}
                        disabled={
                          !active ||
                          !account ||
                          !selectedPortal ||
                          !allowanceXIOPool ||
                          !allowanceALTPool ||
                          quantityXIO <= 0 ||
                          quantityAlt <= 0 ||
                          loadingRedux.pool ||
                          chainId !== CONSTANTS.CHAIN_ID ||
                          parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                          parseFloat(quantityXIO) > parseFloat(walletBalance)
                        }
                        onClickPool={onClickPool}
                        showBack={false}
                      />
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
                      Approve <b>FLASH</b> before <b>pool</b>
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
                      Connect wallet to pool
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
                POOL DASHBOARD
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordion}>
              <PoolTable
                onClickUnstake={onClickUnstake}
                onClickApprovePool={onClickApprovePool}
                selectedQueryData={queryData}
                onClickPool={onClickPool}
                setShowStakeDialog={setShowStakeDialog}
                importToken={importTokenFunc}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
        {/* </SlideDown> */}
        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={[
            "APPROVE FLASH",
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
              ? // ? dialogStep3 === "pendingApproval" ||
                dialogStep3 === "approvalTokenProposal" ||
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
              approvalTokenProposal: (
                <Fragment>
                  <Typography variant="body2" className={classes.textBold}>
                    APPROVE {selectedRewardToken?.tokenB?.symbol}
                    <br />
                  </Typography>
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
                      chainId !== CONSTANTS.CHAIN_ID
                    }
                    loading={loadingRedux.approval && loadingRedux.approvalXIO}
                  >
                    {loadingRedux.approval && loadingRedux.approvalXIO
                      ? "APPROVING"
                      : !allowanceXIOPool
                      ? `APPROVE ${selectedStakeToken}`
                      : `APPROVE ${selectedRewardToken?.tokenB?.symbol || ""}`}
                  </Button>
                </Fragment>
              ),
              poolProposal: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    Add{" "}
                    <Tooltip title={`${quantityXIO} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(quantityXIO)} FLASH
                      </span>
                    </Tooltip>{" "}
                    and{" "}
                    <Tooltip
                      title={`${quantityAlt} ${selectedRewardToken?.tokenB?.symbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(quantityAlt)}{" "}
                        {selectedRewardToken?.tokenB?.symbol}
                      </span>
                    </Tooltip>{" "}
                    into FLASH/{selectedRewardToken?.tokenB?.symbol} pool
                  </Typography>
                  <AddDropDown
                    quantityAlt={quantityAlt}
                    quantityXIO={quantityXIO}
                    selectedRewardToken={selectedRewardToken}
                    queryData={queryData}
                    disabled={
                      !active ||
                      !account ||
                      !selectedPortal ||
                      !allowanceXIOPool ||
                      !allowanceALTPool ||
                      quantityXIO <= 0 ||
                      quantityAlt <= 0 ||
                      loadingRedux.pool ||
                      chainId !== CONSTANTS.CHAIN_ID ||
                      parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                      parseFloat(quantityXIO) > parseFloat(walletBalance)
                    }
                    onClickPool={onClickPool}
                  />
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
              successApproval: (
                <Fragment>
                  <Typography variant="body2" className={classes.textBold}>
                    APPROVAL
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>

                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    You have successfully approved
                  </Typography>

                  <Button variant="retro" fullWidth onClick={onClickClose}>
                    CLOSE
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
                    Adding{" "}
                    <Tooltip
                      title={`${liquidityRequest.quantityAlt} ${liquidityRequest.altSymbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityAlt)}{" "}
                        {liquidityRequest.altSymbol}
                      </span>
                    </Tooltip>{" "}
                    and{" "}
                    <Tooltip title={`${liquidityRequest.quantityXIO} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityXIO)} FLASH
                      </span>
                    </Tooltip>{" "}
                    to{" "}
                    <span className={classes.redText}>
                      FLASH/{liquidityRequest.altSymbol} pool
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
                    You have successfully added{" "}
                    <Tooltip
                      title={`${liquidityRequest.quantityAlt} ${liquidityRequest.altSymbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityAlt)}{" "}
                        {liquidityRequest.altSymbol}
                      </span>
                    </Tooltip>{" "}
                    and{" "}
                    <Tooltip title={`${liquidityRequest.quantityXIO} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(liquidityRequest.quantityXIO)} FLASH
                      </span>
                    </Tooltip>{" "}
                    to{" "}
                    <span className={classes.redText}>
                      {liquidityRequest.altSymbol} pool
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://ropsten.etherscan.io/tx/${liquidityTxnHash}`}
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
                    Withdrawing{" "}
                    <Tooltip
                      title={`${withdrawLiquidityRequest._liquidity} FLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(withdrawLiquidityRequest._liquidity)}
                      </span>
                    </Tooltip>{" "}
                    <span className={classes.redText}>
                      FLASH/{withdrawLiquidityRequest._token} LP tokens
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
                    You have successfully withdrawn{" "}
                    <Tooltip
                      title={`${withdrawLiquidityRequest._liquidity} FLASH`}
                    >
                      <span className={classes.redText}>
                        {trunc(withdrawLiquidityRequest._liquidity)} FLASH/
                        {withdrawLiquidityRequest._token} LP tokens
                      </span>
                    </Tooltip>{" "}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://ropsten.etherscan.io/tx/${withdrawLiquidityTxnHash}`}
                      // href={`https://ropsten.etherscan.io/tx/${withdrawLiquidityTxnHash}`}
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

        <Dialog
          open={showStakeDialog2}
          // open={true}
          steps={[
            "APPROVE FLASH",
            `APPROVE ${selectedRewardToken?.tokenB?.symbol}`,
            "POOL",
          ]}
          title="POOL"
          onClose={() => setShowStakeDialog2(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep3.includes(item)
          )}
          step={dialogStep3}
          stepperShown={
            quantityXIO > 0 && quantityAlt > 0
              ? // ? dialogStep3 === "pendingApproval" ||
                dialogStep3 === "approvalTokenProposal" ||
                dialogStep3 === "poolProposal"
              : null
          }
        >
          {
            {
              poolProposal: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    LIQUIDITY DEPOSIT
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    Add{" "}
                    <Tooltip title={`${quantityXIO} FLASH`}>
                      <span className={classes.redText}>
                        {trunc(quantityXIO)} FLASH
                      </span>
                    </Tooltip>{" "}
                    and{" "}
                    <Tooltip
                      title={`${quantityAlt} ${selectedRewardToken?.tokenB?.symbol}`}
                    >
                      <span className={classes.redText}>
                        {trunc(quantityAlt)}{" "}
                        {selectedRewardToken?.tokenB?.symbol}
                      </span>
                    </Tooltip>{" "}
                    into FLASH/{selectedRewardToken?.tokenB?.symbol} pool
                  </Typography>
                  <AddDropDown
                    quantityAlt={quantityAlt}
                    quantityXIO={quantityXIO}
                    selectedRewardToken={selectedRewardToken}
                    queryData={queryData}
                    disabled={
                      !active ||
                      !account ||
                      !selectedPortal ||
                      !allowanceXIOPool ||
                      !allowanceALTPool ||
                      quantityXIO <= 0 ||
                      quantityAlt <= 0 ||
                      loadingRedux.pool ||
                      chainId !== CONSTANTS.CHAIN_ID ||
                      parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                      parseFloat(quantityXIO) > parseFloat(walletBalance)
                    }
                    onClickPool={onClickPool}
                  />
                </Fragment>
              ),
            }[dialogStep3]
          }
        </Dialog>
      </Fragment>
    </PageAnimation>
  );
}
const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding, animation, heightVal, theme },
  web3: { active, account, chainId },
  user: { currentStaked, pools, walletBalance, walletBalancesPool, poolData },
  query: { reserveFlashAmount, reserveAltAmount, allPoolsData },
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
  theme,
  allPoolsData,
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
