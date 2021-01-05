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
import { utils } from "ethers";
import { ClearOutlined } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { store } from "../config/reduxStore";
import Button from "./Button";
import RemoveDropDown from "./RemoveDropDown";
import { trunc } from "../utils/utilFunc";
import { connect } from "react-redux";
import {
  setRemoveLiquidity,
  checkAllowancePoolWithdraw,
  getApprovalPoolLiquidity,
  setPoolDialogStep,
} from "../redux/actions/flashstakeActions";

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 500,
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
    fontWeight: 700,
  },
  closeBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: theme.spacing(2),
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "70%",
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
    fontWeight: 500,
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "500 !important",
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
    fontWeight: 500,
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
    fontWeight: 500,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
  },
  loadingIcon: {
    marginRight: 5,
  },
  removeBtn: {
    // backgroundColor: theme.palette.button.retro,
    border: "none",
    // height: 35,
    color: theme.palette.buttonText.dark,
    letterSpacing: 2,
    lineHeight: 1.2,
    borderRadius: theme.palette.ButtonRadius.small,
    fontWeight: 500,
  },
  headingBox: {
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.border.secondary}`,
  },
  mainHeading: {
    fontWeight: 700,
  },
  firstBox: {
    backgroundColor: theme.palette.background.liquidity,
    padding: theme.spacing(2),
    borderRadius: 20,
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
    borderRadius: 20,
    // padding: theme.spacing(2),
    height: 60,
  },
  innerBox: {
    width: "100%",
  },
  fontStyle: {
    fontWeight: 700,
    padding: theme.spacing(0.5, 0),
  },
  removeText: {
    fontWeight: 700,
  },
  fontWeight: {
    fontWeight: 500,
  },
  info: {
    textAlign: "center",
  },
  mainCont: {
    margin: "0 !important",
  },
  slider: {
    color: theme.palette.xioRed.main,
  },
}));

function RemoveLiquidityDropDown({
  open,
  onClose,
  pool,
  closeTimeout,
  items = [],
  onSelect = () => {},
  setRemoveLiquidity,
  selectedRewardToken,
  currentPool,
  setShowStakeDialog,
  checkAllowancePoolWithdraw,
  loading: loadingRedux,
  allowancePoolWithdraw,
  getApprovalPoolLiquidity,
  setPoolDialogStep,
  setRemLiqOpen,
  percentageToRemove,
  setPercentageToRemove,
  closeApproval,
}) {
  const classes = useStyles();

  useEffect(() => {
    if (closeApproval) {
      setShowStakeDialog(false);
    }
  }, [closeApproval]);

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  useEffect(() => {
    checkAllowancePoolWithdraw(currentPool?.pool?.id);
  }, [currentPool]);
  let success = true;
  const onClickApprove = async () => {
    setPoolDialogStep("pendingApproval");
    setShowStakeDialog(true);
    if (!allowancePoolWithdraw) {
      setPoolDialogStep("pendingApproval");
      await getApprovalPoolLiquidity(pool?.pool?.id, success);
    }
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
            REMOVE LIQUIDITY
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
                FLASH / {pool?.pool?.tokenB?.symbol}
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
                Pooled FLASH:
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

        <Box className={classes.removeBox}>
          <Typography className={classes.removeText} variant="body1">
            AMOUNT TO REMOVE
          </Typography>

          <Typography className={classes.removeText} variant="h5">
            {percentageToRemove}%
          </Typography>

          <Slider
            value={percentageToRemove}
            className={classes.slider}
            onChange={(e, v) => setPercentageToRemove(v)}
            aria-labelledby="continuous-slider"
          />
          <Grid container spacing={1} xs={12} className={classes.mainCont}>
            <Grid item xs={6}>
              <Box flex={1} className={classes.outerBox2}>
                <Typography
                  // variant="body2"
                  variant="body2"
                  className={classes.secondaryText}
                >
                  {/* AMOUNT OF FLASH REQUIRED TO POOL */}
                  FLASH
                </Typography>
                <Tooltip title={(percentageToRemove / 100) * pool.pooledFlash}>
                  <Typography variant="h6" className={classes.secondaryText}>
                    {trunc((percentageToRemove / 100) * pool.pooledFlash)}
                  </Typography>
                </Tooltip>
                {/* <Box className={classes.textFieldContainer}></Box> */}
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box flex={1} className={classes.outerBox2}>
                <Typography
                  // variant="body2"
                  variant="body2"
                  className={classes.secondaryText}
                >
                  {/* AMOUNT OF FLASH REQUIRED TO POOL */}
                  {pool?.pool?.tokenB?.symbol}
                </Typography>
                <Tooltip title={(percentageToRemove / 100) * pool.pooledAlt}>
                  <Typography variant="h6" className={classes.secondaryText}>
                    {trunc((percentageToRemove / 100) * pool.pooledAlt)}
                  </Typography>
                </Tooltip>
                {/* <Box className={classes.textFieldContainer}></Box> */}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box className={classes.info}>
          <Typography className={classes.fontWeight}>
            1 FLASH ={" "}
            {trunc(
              utils.formatUnits(
                pool?.poolQueryData?.reserveAltAmount?.toString() || "0",
                selectedRewardToken?.tokenB?.decimal
              ) /
                utils.formatUnits(
                  pool?.poolQueryData?.reserveFlashAmount?.toString() || "0",
                  18
                )
            )}{" "}
            {pool?.pool?.tokenB?.symbol}
          </Typography>
          <Typography className={classes.fontWeight}>
            1 {pool.pool?.tokenB?.symbol} ={" "}
            {trunc(
              utils.formatUnits(
                pool?.poolQueryData?.reserveFlashAmount?.toString() || "0",
                18
              ) /
                utils.formatUnits(
                  pool?.poolQueryData?.reserveAltAmount?.toString() || "0",
                  selectedRewardToken?.tokenB?.decimal
                )
            )}{" "}
            FLASH
          </Typography>
        </Box>

        {/* <Grid container xs={12} spacing={2} className={classes.btns}>
          <Grid item xs={6} className={classes.innerBox}>
            <Button disabled={checkAllowancePool} fullWidth variant="retro">
              APPROVE
            </Button>
          </Grid>

          <Grid item xs={6} className={classes.innerBox}>
            <RemoveDropDown
              pool={pool}
              percentageToRemove={percentageToRemove}
              currentPool={currentPool}
              setShowStakeDialog={setShowStakeDialog}
            />
          </Grid>
        </Grid> */}

        {!allowancePoolWithdraw ? (
          <Grid container spacing={2} xs={12}>
            <Grid item xs={6} className={classes.btnPaddingRight}>
              <Button fullWidth variant="retro" onClick={onClickApprove}>
                {loadingRedux.approval ? "APPROVING" : `APPROVE`}
              </Button>
            </Grid>
            <Grid item xs={6} className={classes.btnPaddingLeft}>
              {/* <Button
                fullWidth
                variant="retro"
                onClick={onClickPool}
                disabled={
                  !active ||
                  !account ||
                  !selectedPortal ||
                  !checkAllowancePool ||
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
              </Button> */}
              <RemoveDropDown
                pool={pool}
                percentageToRemove={percentageToRemove}
                currentPool={currentPool}
                setShowStakeDialog={setShowStakeDialog}
                allowancePoolWithdraw={allowancePoolWithdraw}
                setRemLiqOpen={setRemLiqOpen}
              />
            </Grid>
          </Grid>
        ) : (
          <RemoveDropDown
            pool={pool}
            percentageToRemove={percentageToRemove}
            currentPool={currentPool}
            setShowStakeDialog={setShowStakeDialog}
            allowancePoolWithdraw={allowancePoolWithdraw}
            setRemLiqOpen={setRemLiqOpen}
          />
        )}
      </Container>
    </MuiDialog>
  );
}

const mapStateToProps = ({
  flashstake: { slip, removeLiquidity, allowancePoolWithdraw },
  ui: { close, loading, closeApproval },
}) => ({
  slip,
  close,
  removeLiquidity,
  loading,
  closeApproval,
  allowancePoolWithdraw,
});

export default connect(mapStateToProps, {
  setRemoveLiquidity,
  checkAllowancePoolWithdraw,
  getApprovalPoolLiquidity,
  setPoolDialogStep,
})(RemoveLiquidityDropDown);
