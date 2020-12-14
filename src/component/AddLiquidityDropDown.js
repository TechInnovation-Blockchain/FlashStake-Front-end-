import React, { useEffect, Fragment, useState, useCallback } from "react";
import {
  Dialog as MuiDialog,
  IconButton,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  TextField,
  CircularProgress,
  Grid,
  Slider,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClearOutlined } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { store } from "../config/reduxStore";
import Button from "./Button";
import RemoveDropDown from "./RemoveDropDown";
import { DropdownDialog, Dialog } from "./index";
import AddDropDown from "./AddDropDown";

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
} from "../redux/actions/flashstakeActions";
import { setExpandAccodion } from "../redux/actions/uiActions";
import { trunc } from "../utils/utilFunc";
import { connect } from "react-redux";

import {
  setLoading,
  showWalletBackdrop,
  setHeightValue,
} from "../redux/actions/uiActions";
import { setRefetch } from "../redux/actions/dashboardActions";
import { getQueryData } from "../redux/actions/queryActions";
import MaxBtn from "./MaxBtn";
import { updateAllBalances } from "../redux/actions/userActions";
import Web3 from "web3";
import { JSBI } from "@uniswap/sdk";
import { _error } from "../utils/log";
import { utils } from "ethers";

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    cursor: "Pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    background: theme.palette.button.retro,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    cursor: "pointer",

    "&:hover": {
      background: theme.palette.button.hover,
    },
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
  },
  dropdownIcon: {
    color: theme.palette.xioRed.main,
    position: "absolute",
    right: 0,
    // margin: theme.spacing(1),
    fontWeight: 900,
  },
  closeBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    padding: theme.spacing(2, 0),
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  clearSearch: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.disabled,
  },
  dialogPaper: {
    maxWidth: 400,
    width: "100vw",
    borderRadius: 0,
  },
  dialog: {
    textAlign: "center",
    padding: theme.spacing(2),
    // paddingBottom: 0,

    "&>*": {
      marginBottom: theme.spacing(2),
    },
    background: theme.palette.background.primary,
  },
  dialogHeading: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      // fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  list: {
    maxHeight: 130,
    overflowY: "scroll",
    padding: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    filter: "grayscale(1)",

    "&:hover": {
      filter: "none",
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.secondary3,
    },

    // "&:hover": {
    //   color: theme.palette.text.primary,
    // },
  },
  listItemText: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },
  disabledText: {
    // color: theme.palette.xioRed.main,
    color: theme.palette.text.disabled,
    // fontSize: 12,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText2: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: theme.spacing(1),
  },
  link: {
    textDecoration: "none",
  },
  loadingIcon: {
    marginRight: 5,
  },
  addBtn: {
    // backgroundColor: theme.palette.button.retro,
    border: "none",
    // height: 35,
    color: theme.palette.buttonText.dark,
    letterSpacing: 2,
    lineHeight: 1.2,
    borderRadius: theme.palette.ButtonRadius.small,
    fontWeight: 700,
  },
  headingBox: {
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.border.secondary}`,
  },
  mainHeading: {
    fontWeight: 900,
  },
  firstBox: {
    backgroundColor: theme.palette.background.liquidity,
    padding: theme.spacing(2),
    borderRadius: 10,
  },
  outerBox: {
    display: "flex",
    width: "100%",
  },
  outerBox2: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 10,
    // padding: theme.spacing(2),
    height: 60,
  },
  outerBox3: {
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 10,
    padding: theme.spacing(1),
  },
  innerBox: {
    // width: "100%",
  },
  fontStyle: {
    fontWeight: 900,
    padding: theme.spacing(0.5, 0),
  },
  removeText: {
    fontWeight: 900,
  },
  info: {
    textAlign: "left",
  },
  mainCont: {
    margin: "0 !important",
  },

  // =======================================================
  gridSpace2: {
    margin: theme.spacing(1, 0),
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
}));

function AddLiquidityDropDown({
  open,
  onClose,
  pool,
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = {},
  disableDrop,
  link,
  type = "stake",
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
  poolData,
  queryData,
  onClickPool,
  theme,
  ...props
}) {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityXIO, setQuantityXIO] = useState("");
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  // const [addLiq, setAddLiq] = useState(true);
  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

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

  // useEffect(() => {
  //   quote();
  // }, [selectedPortal]);

  const quote = useCallback(
    async (_amountA, _amountType = "alt") => {
      try {
        const _queryData = await getQueryData(selectedPortal);
        const { reserveFlashAmount, reserveAltAmount } = _queryData;
        const [_reserveA, _reserveB] =
          _amountType === "alt"
            ? [reserveAltAmount, reserveFlashAmount]
            : [reserveFlashAmount, reserveAltAmount];
        return Web3.utils.fromWei(
          String(
            JSBI.divide(
              JSBI.multiply(
                JSBI.BigInt(
                  utils.parseUnits(
                    _amountA.toString(),
                    selectedRewardToken?.tokenB?.decimal
                  )
                ),
                JSBI.BigInt(_reserveB)
              ),
              JSBI.BigInt(_reserveA)
            )
          )
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
        setQuantityXIO(_val);
      }
    },
    [selectedRewardToken]
  );

  const onChangeQuantityXIO = useCallback(
    async ({ target: { value } }) => {
      if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
        setQuantityXIO(value);
        const _val = selectedRewardToken?.id ? await quote(value, "xio") : "0";
        setQuantityAlt(_val);
      }
    },
    [selectedRewardToken]
  );

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

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
  };

  return (
    <MuiDialog
      open={open}
      // open={true}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <Container maxWidth="xs" className={classes.dialog}>
        <Box className={classes.closeBtnContainer}>
          <Typography variant="body1" className={classes.dialogHeading}>
            ADD LIQUIDITY
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            className={classes.closeIcon}
          >
            <ClearOutlined />
          </IconButton>
        </Box>

        <Box className={classes.headingBox}>
          <Typography className={classes.mainHeading}>YOUR POSITION</Typography>
        </Box>

        <Box className={classes.firstBox}>
          <Grid xs={12} className={classes.outerBox}>
            <Grid
              xs={6}
              style={{ textAlign: "left" }}
              className={classes.innerBox}
            >
              <Typography className={classes.fontStyle} variant="h5">
                $FLASH / {pool?.pool?.tokenB?.symbol}
              </Typography>
            </Grid>
            <Grid xs={6} style={{ textAlign: "right" }}>
              <Tooltip title={pool?.balance || 0}>
                <Typography variant="h5" className={classes.fontStyle}>
                  {trunc(pool?.balance || 0)}
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>

          <Grid xs={12} className={classes.outerBox}>
            <Grid
              xs={6}
              style={{ textAlign: "left" }}
              className={classes.innerBox}
            >
              <Typography className={classes.fontStyle} variant="body2">
                Pooled $FLASH:
              </Typography>
            </Grid>
            <Grid xs={6} style={{ textAlign: "right" }}>
              <Tooltip title={pool?.pooledFlash || 0}>
                <Typography className={classes.fontStyle} variant="body2">
                  {trunc(pool?.pooledFlash || 0)}
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>

          <Grid xs={12} className={classes.outerBox}>
            <Grid
              xs={6}
              style={{ textAlign: "left" }}
              className={classes.innerBox}
            >
              <Typography className={classes.fontStyle} variant="body2">
                Pooled {pool?.pool?.tokenB?.symbol}:
              </Typography>
            </Grid>
            <Grid xs={6} style={{ textAlign: "right" }}>
              <Tooltip title={pool?.pooledAlt || 0}>
                <Typography className={classes.fontStyle} variant="body2">
                  {trunc(pool?.pooledAlt || 0)}
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>

          <Grid xs={12} className={classes.outerBox}>
            <Grid
              xs={6}
              style={{ textAlign: "left" }}
              className={classes.innerBox}
            >
              <Typography className={classes.fontStyle} variant="body2">
                Your pool share:
              </Typography>
            </Grid>
            <Grid xs={6} style={{ textAlign: "right" }}>
              <Tooltip title={`${pool?.poolShare || 0}%`}>
                <Typography className={classes.fontStyle} variant="body2">
                  {trunc(pool?.poolShare || 0)}%
                </Typography>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Grid container spacing={2}>
            <Grid container className={classes.gridSpace2} item xs={6}>
              <Box flex={1}>
                <Typography
                  // variant="body2"
                  variant="body1"
                  className={classes.secondaryText2}
                >
                  {/* QUANTITY */}
                  Quantity
                </Typography>
                <Box className={classes.textFieldContainer}>
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
                className={classes.secondaryText2}
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
              />
            </Grid>

            <Grid container item xs={12}>
              <Box flex={1}>
                <Typography
                  // variant="body2"
                  variant="body1"
                  className={classes.secondaryText2}
                >
                  {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                  Amount of $FLASH required to pool
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

            <Fragment>
              <Grid item xs={4}>
                <Box flex={1} className={classes.outerBox3}>
                  <Typography
                    // variant="body2"
                    variant="body2"
                    className={classes.secondaryText}
                  >
                    {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                    $FLASH per {selectedRewardToken?.tokenB?.symbol}
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
                <Box flex={1} className={classes.outerBox3}>
                  <Typography
                    // variant="body2"
                    variant="body2"
                    className={classes.secondaryText}
                  >
                    {selectedRewardToken?.tokenB?.symbol} per $FLASH
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
                <Box flex={1} className={classes.outerBox3}>
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
                            Web3.utils.fromWei(
                              queryData.reserveFlashAmount || "0"
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
                              Web3.utils.fromWei(
                                queryData.reserveFlashAmount || "0"
                              )
                            ))) *
                          100
                      ) || 0}
                      %
                    </Typography>
                  </Tooltip>
                </Box>
              </Grid>
            </Fragment>
          </Grid>
        </Box>

        {/* <Grid container xs={12} className={classes.innerBox}> */}
        {!allowanceXIOPool || !allowanceALTPool ? (
          <Grid container spacing={2} xs={12} onClick={showWalletHint}>
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
                loading={loadingRedux.approval && loadingRedux.approvalXIO}
              >
                {loadingRedux.approval && loadingRedux.approvalXIO
                  ? "APPROVING"
                  : !allowanceXIOPool
                  ? `APPROVE ${selectedStakeToken}`
                  : `APPROVE ${selectedRewardToken.tokenB.symbol || ""}`}
              </Button>
            </Grid>
            <Grid item xs={6} className={classes.btnPaddingLeft}>
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
                  chainId !== 4 ||
                  parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                  parseFloat(quantityXIO) > parseFloat(walletBalance)
                }
                onClickPool={onClickPool}
              />
            </Grid>
          </Grid>
        ) : (
          <Fragment>
            <Grid item xs={12} onClick={showWalletHint}>
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
                  chainId !== 4 ||
                  parseFloat(quantityAlt) > parseFloat(balanceALT) ||
                  parseFloat(quantityXIO) > parseFloat(walletBalance)
                }
                onClickPool={onClickPool}
              />
            </Grid>
          </Fragment>
        )}
        {/* </Grid> */}
      </Container>
    </MuiDialog>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding, animation, heightVal, theme },
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
  theme,
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
})(AddLiquidityDropDown);
