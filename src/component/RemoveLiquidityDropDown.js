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
import { trunc } from "../utils/utilFunc";
import { connect } from "react-redux";
import { setRemoveLiquidity } from "../redux/actions/flashstakeActions";

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
  innerBox: {
    width: "100%",
  },
  fontStyle: {
    fontWeight: 900,
    padding: theme.spacing(0.5, 0),
  },
  removeText: {
    fontWeight: 900,
  },
  fontWeight: {
    fontWeight: 700,
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
}) {
  const classes = useStyles();
  const [percentageToRemove, setPercentageToRemove] = useState(5);

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  useEffect(() => {}, [pool]);

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
                  {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
                  $FLASH
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
                  {/* AMOUNT OF $FLASH REQUIRED TO POOL */}
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
            1 $FLASH ={" "}
            {trunc(
              pool?.poolQueryData?.reserveAltAmount /
                pool?.poolQueryData?.reserveFlashAmount
            ) || 0}{" "}
            {pool?.pool?.tokenB?.symbol}
          </Typography>
          <Typography className={classes.fontWeight}>
            1 {pool.pool?.tokenB?.symbol} ={" "}
            {trunc(
              pool?.poolQueryData?.reserveFlashAmount /
                pool?.poolQueryData?.reserveAltAmount
            ) || 0}{" "}
            $FLASH
          </Typography>
        </Box>

        <Grid container xs={12} spacing={2} className={classes.btns}>
          <Grid item xs={6} className={classes.innerBox}>
            <Button fullWidth variant="retro">
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
        </Grid>
      </Container>
    </MuiDialog>
  );
}

const mapStateToProps = ({
  flashstake: { slip, removeLiquidity },
  ui: { close },
}) => ({
  slip,
  close,
  removeLiquidity,
});

export default connect(mapStateToProps, { setRemoveLiquidity })(
  RemoveLiquidityDropDown
);
