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
import { trunc } from "../utils/utilFunc";
import Web3 from "web3";
import { JSBI } from "@uniswap/sdk";
import { connect } from "react-redux";
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
  },
  dropdownIcon: {
    color: theme.palette.xioRed.main,
    position: "absolute",
    right: 0,
    fontWeight: 900,
  },
  closeBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: theme.spacing(2),
    marginTop: 6,
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
    top: "50%",
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
  },
  listItemText: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },
  disabledText: {
    color: theme.palette.text.disabled,
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
  addBtn: {
    border: "none",
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
    alignItems: "center",
  },
  outerBox2: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 10,
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
    textAlign: "left",
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
}));

function AddDropDown({
  quantityAlt,
  quantityXIO,
  queryData,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedRewardToken,
  disabled,
  onClickPool,
  slip,
  showBack = true,
  closeLiquidityTxnHash,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const history = useHistory();

  // useEffect(() => {
  //   setTimeout(() => {
  //     toggleFalse();
  //   }, 5000);
  // }, []);

  const handleConfirm = (quantityAlt, quantityXIO) => {
    onClickPool(quantityAlt, quantityXIO);
    // onClose();
  };

  useEffect(() => {
    if (closeLiquidityTxnHash) {
      onClose();
    }
  }, [closeLiquidityTxnHash]);

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
    // setAddLiqOpen(true);
  }, []);
  const onBack = useCallback(() => {
    setOpen(false);
    // setAddLiqOpen(true);
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

  const getMintAmount = useCallback(() => {
    const _poolTotalSupply = utils.formatUnits(
      queryData?.poolTotalSupply?.toString() || "0",
      18
    );
    const _reserveFlashAmount = utils.formatUnits(
      queryData?.reserveFlashAmount?.toString() || "0",
      18
    );
    const _reserveAltAmount = utils.formatUnits(
      queryData?.reserveAltAmount?.toString() || "0",
      selectedRewardToken?.tokenB?.decimal
    );
    if (_poolTotalSupply > 0) {
      return Math.min(
        (quantityXIO * _poolTotalSupply) / _reserveFlashAmount,
        (quantityAlt * _poolTotalSupply) / _reserveAltAmount
      );
    } else {
      return Math.sqrt(quantityXIO * quantityAlt * 1000);
    }
  }, [queryData, quantityAlt, quantityXIO]);

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };
  return (
    <Fragment>
      <Button
        fullWidth
        variant="retro"
        disabled={disabled}
        // loading={loadingRedux.pool}
        onClick={() => {
          setOpen(true);
        }}
      >
        ADD LIQUIDITY
      </Button>

      <MuiDialog
        open={open}
        // open={true}
        onClose={onClose}
        PaperProps={{ className: classes.dialogPaper }}
      >
        <Container maxWidth="xs" className={classes.dialog}>
          <Box className={classes.closeBtnContainer}>
            {showBack ? (
              <IconButton
                size="small"
                onClick={onBack}
                className={classes.backIcon}
              >
                <ArrowBackIcon />
              </IconButton>
            ) : null}

            <IconButton
              size="small"
              onClick={onClose}
              className={classes.closeIcon}
            >
              <ClearOutlined />
            </IconButton>
          </Box>

          <Box className={classes.firstBox}>
            <Grid container xs={12} className={classes.outerBox}>
              <Grid
                item
                xs={12}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="h4">
                  {trunc(getMintAmount())}
                </Typography>
              </Grid>
              <Grid xs={12} style={{ textAlign: "left" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  $FLASH/{selectedRewardToken?.tokenB?.symbol} Pool Tokens
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.removeBox}>
            <Typography className={classes.removeText} variant="body2">
              Output is estimated. If the price changes by more than {slip}%,
              your transaction will revert
            </Typography>
          </Box>

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="caption">
                  $FLASH Deposited:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Tooltip title={quantityXIO}>
                  <Typography className={classes.fontStyle} variant="body2">
                    {trunc(quantityXIO)}
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
                <Typography className={classes.fontStyle} variant="caption">
                  {selectedRewardToken?.tokenB?.symbol} Deposited:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Tooltip title={quantityAlt}>
                  <Typography className={classes.fontStyle} variant="body2">
                    {trunc(quantityAlt)}
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>

            <Grid
              xs={12}
              style={{ padding: "10px 0" }}
              className={classes.outerBox}
            >
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="caption">
                  Rates:
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography className={classes.fontStyle} variant="body2">
                  1 $FLASH ={" "}
                  {trunc(
                    queryData.reserveAltAmount / queryData.reserveFlashAmount
                  ) || 0}{" "}
                  {selectedRewardToken?.tokenB?.symbol}
                </Typography>
                <Typography className={classes.fontStyle} variant="body2">
                  1 {selectedRewardToken?.tokenB?.symbol} ={" "}
                  {trunc(
                    queryData.reserveFlashAmount / queryData.reserveAltAmount
                  ) || 0}{" "}
                  $FLASH
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
                <Tooltip
                  title={`${
                    (quantityXIO /
                      (parseFloat(quantityXIO) +
                        parseFloat(
                          utils.formatUnits(
                            queryData?.reserveFlashAmount?.toString() || "0",
                            18
                          )
                        ))) *
                      100 || 0
                  }%`}
                >
                  <Typography className={classes.fontStyle} variant="body2">
                    {trunc(
                      (quantityXIO /
                        (parseFloat(quantityXIO) +
                          parseFloat(
                            utils.formatUnits(
                              queryData?.reserveFlashAmount?.toString() || "0",
                              18
                            )
                          ))) *
                        100
                    ) || 0}
                    %
                  </Typography>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="retro"
            fullWidth
            onClick={() => handleConfirm(quantityAlt, quantityXIO)}
          >
            CONFIRM
          </Button>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}
const mapStateToProps = ({ flashstake: { slip, closeLiquidityTxnHash } }) => ({
  slip,
  closeLiquidityTxnHash,
});

export default connect(mapStateToProps, {})(AddDropDown);
