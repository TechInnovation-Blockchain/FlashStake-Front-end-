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
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { ClearOutlined } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { store } from "../config/reduxStore";
import Button from "./Button";
import { setClose } from "../redux/actions/uiActions";
import { connect } from "react-redux";
import { trunc } from "../utils/utilFunc";
import {
  setRemoveLiquidity,
  removeTokenLiquidityInPool,
  setPoolDialogStep,
} from "../redux/actions/flashstakeActions";

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
    width: "100%",

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
    paddingTop: theme.spacing(2),
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "70%",
    transform: "translateY(-50%)",
  },
  backIcon: {
    position: "absolute",
    left: 0,
    top: "70%",
    transform: "translateY(-50%)",
    color: theme.palette.xioRed.main,
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
    fontWeight: 700,
    borderRadius: theme.palette.ButtonRadius.small,
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
  innerBox: {
    width: "100%",
  },
  fontStyle: {
    fontWeight: 900,
  },
  removeText: {
    fontWeight: 900,
    textTransform: "uppercase",
  },
  info: {
    textAlign: "center",
    // display: "flex",
  },
  mainCont: {
    margin: "0 !important",
  },
  burnedText: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fontWeight: {
    fontweight: 700,
  },
}));

function RemoveDropDown({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = {},
  disableDrop,
  link,
  type = "stake",
  slip,
  close,
  pool,
  percentageToRemove,
  setRemoveLiquidity,
  removeLiquidity,
  removeTokenLiquidityInPool,
  currentPool,
  setPoolDialogStep,
  setShowStakeDialog,
  checkAllowancePoolWithdraw,
  allowancePoolWithdraw,
  setRemLiqOpen,
  withdrawLiquidityTxnHash,
  closeLiquidityTxnHash,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hide, setHide] = useState(closeLiquidityTxnHash);

  const onClose = useCallback(() => {
    setOpen(false);
    setRemLiqOpen(false);
  }, []);

  const onBack = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  const removeLiq = () => {
    setPoolDialogStep("pendingWithdrawLiquidity");
    setShowStakeDialog(true);
    removeTokenLiquidityInPool(pool, percentageToRemove);
  };
  // };

  const closeDialog = () => {
    onClose();
  };

  useEffect(() => {
    if (closeLiquidityTxnHash) {
      closeDialog();
    }
  }, [closeLiquidityTxnHash]);

  return (
    <Fragment>
      <Button
        fullWidth
        variant="retro"
        disabled={!allowancePoolWithdraw || percentageToRemove === 0}
        // loading={loadingRedux.pool}
        className={classes.removeBtn}
        onClick={() => {
          !disableDrop && !link && setOpen(true);
          // setRemoveLiquidity(pool?.balance * (percentageToRemove / 100));
        }}
      >
        REMOVE
      </Button>
      {/* <Button
        className={classes.dropdown}
        onClick={() => {
          !disableDrop && !link && setOpen(true);
          // setRemoveLiquidity(pool?.balance * (percentageToRemove / 100));
        }}
        // disabled={!checkAllowancePoolWithdraw}
      >
        <Typography
          variant="body1"
          className={classes.removeBtn}
          onClick={() => !disableDrop && !link && setOpen(true)}
        >
          REMOVE
        </Typography>
      </Button> */}

      <MuiDialog
        open={open}
        // open={true}
        onClose={onClose}
        PaperProps={{ className: classes.dialogPaper }}
      >
        <Container maxWidth="xs" className={classes.dialog}>
          <Box className={classes.closeBtnContainer}>
            <Typography variant="body1" className={classes.dialogHeading}>
              YOU WILL RECEIVE
            </Typography>

            <IconButton
              size="small"
              onClick={onBack}
              className={classes.backIcon}
            >
              <ArrowBackIcon />
            </IconButton>

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

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Tooltip title={(percentageToRemove / 100) * pool.pooledFlash}>
                  <Typography variant="h6" className={classes.fontStyle}>
                    {trunc((percentageToRemove / 100) * pool.pooledFlash)}
                  </Typography>
                </Tooltip>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  $FLASH
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h3" className={classes.fontStyle}>
            {" "}
            +
          </Typography>

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Tooltip title={(percentageToRemove / 100) * pool.pooledAlt}>
                  <Typography variant="h6" className={classes.fontStyle}>
                    {trunc((percentageToRemove / 100) * pool.pooledAlt)}
                  </Typography>
                </Tooltip>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  {pool?.pool?.tokenB?.symbol}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.removeBox}>
            <Typography className={classes.removeText} variant="body2">
              The above output is estimated
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
                  POOL TOKENS BURNED
                </Typography>
              </Grid>
              <Grid xs={6} className={classes.burnedText}>
                <Typography variant="h6" className={classes.fontStyle}>
                  {trunc((pool.balance * percentageToRemove) / 100)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.info}>
            <Typography className={classes.fontWeight} variant="body2">
              1 $FLASH ={" "}
              {trunc(
                pool?.poolQueryData?.reserveAltAmount /
                  pool?.poolQueryData?.reserveFlashAmount
              ) || 0}{" "}
              {pool?.pool?.tokenB?.symbol}
            </Typography>
            <Typography className={classes.fontWeight} variant="body2">
              1 {pool.pool?.tokenB?.symbol} ={" "}
              {trunc(
                pool?.poolQueryData?.reserveFlashAmount /
                  pool?.poolQueryData?.reserveAltAmount
              ) || 0}{" "}
              $FLASH
            </Typography>
          </Box>

          <Button variant="retro" onClick={removeLiq} fullWidth>
            CONFIRM
          </Button>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}

const mapStateToProps = ({
  flashstake: {
    slip,
    removeLiquidity,
    withdrawLiquidityTxnHash,
    closeLiquidityTxnHash,
  },
  ui: { close },
}) => ({
  slip,
  close,
  closeLiquidityTxnHash,
  removeLiquidity,
  withdrawLiquidityTxnHash,
});

export default connect(mapStateToProps, {
  setClose,

  removeTokenLiquidityInPool,
  setPoolDialogStep,
})(RemoveDropDown);
