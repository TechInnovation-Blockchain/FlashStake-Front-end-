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
    borderRadius: 5,
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
    borderRadius: 5,
    // padding: theme.spacing(2),
    height: 60,
  },
  outerBox3: {
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 5,
    padding: theme.spacing(1),
  },
  innerBox: {
    width: "100%",
  },
  fontStyle: {
    fontWeight: 900,
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
  ...props
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [expanded2, setExpanded2] = useState(true);
  // const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityAlt, setQuantityAlt] = useState("");
  const [quantityXIO, setQuantityXIO] = useState("");

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toUpperCase());
  };

  const filteredData = useCallback(() => {
    return items.filter((item) =>
      item.tokenB?.symbol.toUpperCase().includes(search)
    );
  }, [search, items]);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onSelectLocal = (_pool) => {
    onSelect(_pool);
    onClose();
  };

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  // ==========================================

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

  // const onClickPool = useCallback(() => {
  //   setPoolDialogStep("pendingLiquidity");
  //   setShowStakeDialog(true);
  //   addTokenLiquidityInPool(quantityAlt, quantityXIO, selectedPortal);
  // }, [quantityAlt, quantityXIO, selectedPortal]);

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

  return (
    <Fragment>
      <Box
        className={classes.dropdown}
        onClick={() => !disableDrop && !link && setOpen(true)}
      >
        <Typography
          variant="body1"
          className={classes.addBtn}
          onClick={() => !disableDrop && !link && setOpen(true)}
        >
          ADD
        </Typography>
      </Box>

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
          <Box className={classes.closeBtnContainer}>
            {search ? (
              <IconButton
                size="small"
                onClick={() => setSearch("")}
                className={classes.clearSearch}
              >
                <ClearOutlined />
              </IconButton>
            ) : null}
          </Box>

          <Box className={classes.headingBox}>
            <Typography className={classes.mainHeading}>
              YOUR POSITION
            </Typography>
          </Box>

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="h6">
                  XIO / AAVE
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  0.04602
                </Typography>
              </Grid>
            </Grid>

            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="caption">
                  Pooled XIO:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography className={classes.fontStyle} variant="overline">
                  0.00180469
                </Typography>
              </Grid>
            </Grid>

            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="caption">
                  Pooled AAVE:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography className={classes.fontStyle} variant="overline">
                  1.2683
                </Typography>
              </Grid>
            </Grid>

            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="caption">
                  Your pool share:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography className={classes.fontStyle} variant="overline">
                  {" "}
                  {"<0.01%"}{" "}
                </Typography>
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
                    {/* <IconButton
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
                    </IconButton> */}
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
                    {/* <IconButton
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
                    </IconButton> */}
                  </Box>
                </Box>
              </Grid>
              {/* {!selectedRewardToken?.tokenB?.symbol ? ( */}
              {/* <Grid container item style={{ display: "flex" }}> */}

              <Fragment>
                <Grid item xs={4}>
                  <Box flex={1} className={classes.outerBox3}>
                    <Typography
                      // variant="body2"
                      variant="body2"
                      className={classes.secondaryText}
                    >
                      {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                      {selectedStakeToken} per{" "}
                      {selectedRewardToken?.tokenB?.symbol}
                    </Typography>

                    <Typography
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      610.215
                    </Typography>
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
                      {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                      {selectedStakeToken} per{" "}
                      {selectedRewardToken?.tokenB?.symbol}
                    </Typography>

                    <Typography
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      610.215
                    </Typography>
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
                      {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                      {selectedStakeToken} per{" "}
                      {selectedRewardToken?.tokenB?.symbol}
                    </Typography>

                    <Typography
                      variant="body1"
                      className={classes.secondaryText}
                    >
                      610.215
                    </Typography>
                    {/* <Box className={classes.textFieldContainer}></Box> */}
                  </Box>
                </Grid>
              </Fragment>
            </Grid>
            {/* ) : null} */}
            {/* </Box> */}
          </Box>

          <Grid container xs={12} spacing={2} className={classes.btns}>
            <Grid item xs={12} className={classes.innerBox}>
              <AddDropDown />
            </Grid>
          </Grid>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}

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
})(AddLiquidityDropDown);
