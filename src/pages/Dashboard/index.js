import React, { useEffect, Fragment, useState, useCallback } from "react";
import { connect } from "react-redux";
import { Box, Typography, Grid, Tooltip, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { JSBI } from "@uniswap/sdk";
import { useQuery } from "@apollo/client";
import Web3 from "web3";

import { Table, Dialog, Button, PageAnimation } from "../../component";
import { setLoading, showWalletBackdrop } from "../../redux/actions/uiActions";
import {
  getDashboardProps,
  withdraw,
  withdrawSpecificStakes,
  setDialogStep,
  calculateBurn,
  calculateBurnStakes,
  setRefetch,
  setReCalculateExpired,
  toggleAccordianExpanded,
} from "../../redux/actions/dashboardActions";
import { trunc } from "../../utils/utilFunc";
import { Link } from "@material-ui/icons";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    // padding: theme.spacing(2),
    textAlign: "center",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  redText: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  redTextLight: {
    color: theme.palette.xioRed.main,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 700,
  },
  textBold: {
    fontWeight: 700,
  },
  textField: {
    background: theme.palette.background.secondary,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  linkIcon: {
    color: theme.palette.xioRed.main,
    paddingRight: 5,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  withDrawXio: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: theme.spacing(5, 0),
    // marginTop: 40,
    // marginBottom: 40,
    padding: theme.spacing(0, 1),
  },
  // paddingHorizontal1:{
  //   padd
  // }
  msgContainer: {
    margin: theme.spacing(5, 0),
  },
  msg: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  accrodianCommon: {
    boxShadow: "none",
    borderTop: "none",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",

    "&:before": {
      display: "none",
    },
  },
  accordian: {
    boxShadow: "none",
    backgroundColor: theme.palette.background.secondary2,
  },
  expandedAccordion: {
    backgroundColor: theme.palette.background.secondary2,
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: theme.palette.border.secondary,

    boxShadow: "none",
  },
  accordianSummary: {
    minHeight: "0 !important",
    "& .MuiAccordionSummary-content": {
      margin: "0 !important",
      flexDirection: "column",
    },

    "& .MuiAccordionSummary-expandIcon": {
      position: "absolute",
      right: "10%",
    },
    // width: "100% !important",
  },

  heading1: {
    margin: "auto",
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },

  heading: {
    margin: "auto",
    fontWeight: 700,
    color: theme.palette.text.secondary2,
  },
  available: {
    fontWeight: 700,
    color: theme.palette.text.secondary,
  },
  statekAmount: {
    fontWeight: 700,
    color: theme.palette.text.secondary2,
  },
  btnGrid: {
    marginTop: 40,
    marginBottom: 40,
  },
  withdrawbtn: {
    width: 250,
    borderRadius: 0,
  },
  withdrawAccordian: {
    boxShadow: "none",
    borderTop: "none",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",

    "&:before": {
      display: "none",
    },
  },
  withdrawTextField: {
    background: theme.palette.background.primary,
    marginBottom: 10,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  withdrawTextField2: {
    background: theme.palette.background.primary,
    marginBottom: 10,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      lineHeight: 1.5,
      textAlign: "center",
      color: theme.palette.xioRed.main,
    },
  },
  AccordionDetails: {
    // width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: 0,
  },
  accordionSummary: {
    margin: "auto",
  },
  withdrawText: {
    color: theme.palette.xioRed.main,
  },
  expandIcon: {
    color: theme.palette.xioRed.main,
  },
}));

function Dashboard({
  active,
  account,
  setLoading,
  getDashboardProps,
  withdraw,
  setDialogStep,
  dialogStep,
  setRefetch,
  refetch: refetchRedux,
  withdrawRequest,
  withdrawTxnHash,
  showWalletBackdrop,
  loadingData,
  currentStaked,
  setReCalculateExpired,
  toggleAccordianExpanded,
  expanded,
  selectedStakes,
  isStakesSelected,
  withdrawSpecificStakes,
  balance,
}) {
  const classes = useStyles();
  const [currentPortal, setCurrentPortal] = useState({});
  const [burn, setBurn] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [partialWithdraw, setPartialWithdraw] = useState("");
  const [maxPartialWithdraw, setMaxPartialWithdraw] = useState(0);
  const [burnPartialWithdraw, setBurnPartialWithdraw] = useState(0);
  const [
    selectedStakesWithdrawValues,
    setSelectedStakesWithdrawValues,
  ] = useState({});
  const [_selectedStakesWtihdraw, set_selectedStakesWtihdraw] = useState([]);
  const history = useHistory();

  useEffect(() => {
    document.title = "Dashboard - XIO | The Future is at Stake";
    // setLoading({ dapp: true });
    setRefetch(true);
    setReCalculateExpired(true);
    let reCalculateInterval = setInterval(() => {
      setReCalculateExpired(true);
    }, 60000);
    return () => clearInterval(reCalculateInterval);
  }, [setRefetch, setReCalculateExpired]);

  useEffect(() => {
    if (active && account) {
      showWalletBackdrop(false);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    const burn = calculateBurn(currentPortal);
    if (currentPortal?.stakes?.length) {
      setBurn(burn);
      setMaxAmount(
        (parseFloat(currentPortal.totalStakeAmount) - parseFloat(burn)).toFixed(
          18
        )
      );
    } else {
      setBurn(0);
      setMaxAmount(0);
    }
  }, [currentPortal]);

  useEffect(() => {
    setCurrentPortal(currentStaked);
  }, [currentStaked]);

  useEffect(() => {
    if (partialWithdraw && currentPortal?.stakes?.length) {
      const burn = calculateBurn(currentPortal, false, partialWithdraw);
      setBurnPartialWithdraw(burn);
      setMaxPartialWithdraw(
        (parseFloat(partialWithdraw) - parseFloat(burn)).toFixed(18)
      );
    } else {
      setBurnPartialWithdraw(0);
    }
  }, [partialWithdraw, currentPortal]);

  const withdrawSelected = useCallback(() => {
    const _selectedStakes = currentStaked.stakes.filter(
      (stake) => selectedStakes[stake.id]
    );
    set_selectedStakesWtihdraw(_selectedStakes);
    let amount = JSBI.BigInt(0);
    _selectedStakes.map((_stake) => {
      amount = JSBI.add(amount, JSBI.BigInt(_stake.stakeAmount));
      return null;
    });
    amount = Web3.utils.fromWei(amount.toString());
    if (
      _selectedStakes.find(
        (_stake) =>
          !_stake.expired && _stake.expiry > parseFloat(Date.now() / 1000)
      )
    ) {
      let burn = calculateBurnStakes(_selectedStakes);
      setSelectedStakesWithdrawValues({
        amount,
        burn,
        maxAmount: (parseFloat(amount) - parseFloat(burn)).toFixed(18),
      });
      setDialogStep("confirmSelectedWithdrawBurn");
    } else {
      setSelectedStakesWithdrawValues({
        amount,
      });
      setDialogStep("confirmSelectedWithdraw");
    }
    setShowWithdrawDialog(true);
  }, [currentStaked, selectedStakes, setDialogStep]);

  const openWithdrawDialog = (portal) => {
    setCurrentPortal(portal);
    setDialogStep("selectWithdrawType");
    setShowWithdrawDialog(true);
  };

  const closeDialog = () => {
    setShowWithdrawDialog(false);
  };

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
  };

  // const handleChange = (e) => {
  //   setPartialWithdraw(e.target.value);
  // };
  const regex = /^\d*(.(\d{1,18})?)?$/;

  const handleChange = ({ target: { value } }) => {
    if (Number(value) || value === "" || /^[0]?[.]?$/.test(value)) {
      if (value <= 800 && regex.test(value)) {
        console.log(value, regex.test(value));
        setPartialWithdraw(
          value[value.length - 1] === "." || !Number(value) ? value : value
        );
      }
      // console.log(value, regex.test(va lue), quantity);
    } else {
      setPartialWithdraw((val) => val);
    }
  };

  return (
    <PageAnimation in={true}>
      <Fragment>
        <Box className={classes.contentContainer}>
          {/* <Table loading={loadingData} openWithdrawDialog={openWithdrawDialog} /> */}
          {active && account ? (
            currentStaked?.stakes?.length ? (
              <Fragment>
                <Box className={classes.gridContainer}>
                  <Grid xs={12}>
                    <Typography variant="body1" className={classes.available}>
                      <b>WALLET BALANCE</b>
                    </Typography>
                  </Grid>
                  <Grid xs={12}>
                    <Tooltip
                      // title={`${maxAmount}/${currentStaked.totalStakeAmount} XIO`}
                      // title={`${currentStaked.availableStakeAmount}/${currentStaked.totalStakeAmount} XIO`}
                      title={`${trunc(balance)} XIO`}
                    >
                      <Typography variant="h6" className={classes.statekAmount}>
                        {/* {`${trunc(currentStaked.availableStakeAmount)}/${trunc(
                          currentStaked.totalStakeAmount
                        )} XIO`} */}
                        {/* {`${trunc(maxAmount)}/${trunc(
                          currentStaked.totalStakeAmount
                        )} XIO`} */}
                        {trunc(balance)} XIO
                      </Typography>
                    </Tooltip>
                  </Grid>
                </Box>

                <Box className={classes.gridContainer}>
                  <Grid xs={12}>
                    <Typography variant="body1" className={classes.available}>
                      <b>RESTAKEABLE BALANCE</b>
                    </Typography>
                    <Tooltip
                      title={`${currentStaked.availableStakeAmount}/${currentStaked.availableStakeAmount} XIO`}
                      // title={`${currentStaked.availableStakeAmount}/${currentStaked.totalStakeAmount} XIO`}
                    >
                      <Typography variant="h6" className={classes.statekAmount}>
                        {/* {`${trunc(currentStaked.availableStakeAmount)}/${trunc(
                          currentStaked.totalStakeAmount
                        )} XIO`} */}
                        {`${trunc(currentStaked.availableStakeAmount)} XIO`}
                      </Typography>
                    </Tooltip>
                  </Grid>
                  {/* <Grid xs={6}>
                    <Typography variant="body1" className={classes.available}>
                      <b></b>
                    </Typography>
                    <Tooltip
                      title={`${currentStaked.lockedStakeAmount - burn}/${
                        currentStaked.lockedStakeAmount
                      } XIO`}
                      // title={`${currentStaked.availableStakeAmount}/${currentStaked.totalStakeAmount} XIO`}
                    >
                      <Typography variant="h6" className={classes.statekAmount}>
                        {`${trunc(currentStaked.availableStakeAmount)}/${trunc(
                          currentStaked.totalStakeAmount
                        )} XIO`}
                        {`${trunc(
                          currentStaked.lockedStakeAmount - burn
                        )}/${trunc(currentStaked.lockedStakeAmount)} XIO`}
                      </Typography>
                    </Tooltip>
                  </Grid> */}
                </Box>

                {/* <Box className={classes.gridContainer}>
                  <Grid item xs={12}>
                    <Accordion
                      className={`${classes.accrodianCommon} ${
                        !expanded
                          ? classes.accordian
                          : classes.expandedAccordion
                      }`}
                      expanded={expanded}
                    >
                      <AccordionSummary
                        onClick={toggleAccordianExpanded}
                        expandIcon={
                          <ExpandMoreIcon className={classes.expandIcon} />
                        }
                        aria-controls="panel1d-content"
                        id="panel1d-header"
                        className={classes.accordionSummary}
                      >
                        <Typography className={classes.heading}>
                          DAPP BALANCE
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails className={classes.AccordionDetails}>
                        <Table
                          loading={loadingData}
                          openWithdrawDialog={openWithdrawDialog}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </Box> */}
                <Accordion
                  className={`${classes.accrodianCommon} ${
                    !expanded ? classes.accordian : classes.expandedAccordion
                  }`}
                  expanded={expanded}
                >
                  <Box>
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon className={classes.expandIcon} />
                      }
                      onClick={toggleAccordianExpanded}
                      expand
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                      className={classes.accordianSummary}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          className={classes.heading1}
                        >
                          DAPP BALANCE
                        </Typography>
                        <Typography variant="h6" className={classes.heading}>
                          {`${trunc(maxAmount)}/${trunc(
                            currentStaked.totalStakeAmount
                          )} XIO`}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                  </Box>
                  <AccordionDetails>
                    <Table
                      loading={loadingData}
                      openWithdrawDialog={openWithdrawDialog}
                    />
                  </AccordionDetails>
                </Accordion>
                <Grid xs={12} className={classes.btnGrid}>
                  <Button
                    variant="red"
                    className={classes.withdrawbtn}
                    onClick={
                      isStakesSelected && expanded
                        ? withdrawSelected
                        : () => openWithdrawDialog(currentStaked)
                    }
                  >
                    {isStakesSelected && expanded
                      ? "WITHDRAW SELECTED STAKES"
                      : "WITHDRAW"}
                  </Button>
                </Grid>
              </Fragment>
            ) : (
              <Grid item xs={12} className={classes.msgContainer}>
                <Typography variant="body2" className={classes.msg}>
                  NO AVAILABLE STAKES
                </Typography>
                <Button
                  variant="red"
                  onClick={() => history.push("/flashstake")}
                >
                  FLASHSTAKE NOW
                </Button>
              </Grid>
            )
          ) : (
            <Box
              className={`${classes.gridContainer} ${classes.paddingHorizontal1}`}
            >
              <Typography variant="body2" className={classes.redTextLight}>
                CONNECT YOUR WALLET TO VIEW YOUR STAKES
              </Typography>
            </Box>
          )}
        </Box>
        <Dialog
          open={showWithdrawDialog}
          // open={true}
          onClose={() => setShowWithdrawDialog(false)}
          status={dialogStep}
          title="WITHDRAW"
        >
          {
            {
              selectWithdrawType: (
                <Fragment>
                  {currentPortal.availableStakeAmount !==
                    currentPortal.totalStakeAmount &&
                  currentPortal.availableStakeAmount > 0 ? (
                    <Typography variant="body1">
                      HOW MANY <span className={classes.redText}>XIO</span>{" "}
                      WOULD YOU LIKE TO WITHDRAW?
                    </Typography>
                  ) : currentPortal.availableStakeAmount <= 0 ? (
                    <Typography className={classes.withDrawXio} variant="body1">
                      YOU CAN EARLY WITHDRAW{" "}
                      <Tooltip title={`${maxAmount} XIO`}>
                        <span className={classes.redText}>
                          {trunc(maxAmount)} XIO
                        </span>
                      </Tooltip>{" "}
                      AT THIS TIME
                    </Typography>
                  ) : (
                    <Typography className={classes.withDrawXio} variant="body1">
                      YOU HAVE{" "}
                      <Tooltip title={`${maxAmount} XIO`}>
                        <span className={classes.redText}>
                          {trunc(maxAmount)} XIO
                        </span>
                      </Tooltip>{" "}
                      AVAILABLE TO WITHDRAW
                    </Typography>
                  )}
                  <Grid container spacing={1}>
                    {currentPortal.availableStakeAmount !==
                    currentPortal.totalStakeAmount ? (
                      currentPortal.availableStakeAmount <= 0 ? (
                        <Grid item xs={12}>
                          <Button
                            variant="red"
                            fullWidth
                            onClick={() => setDialogStep("earlyWithdraw")}
                            disabled={currentPortal.totalStakeAmount <= 0}
                          >
                            <Tooltip title={`${maxAmount} XIO`}>
                              <span>MAX ({trunc(maxAmount)} XIO)</span>
                            </Tooltip>
                          </Button>
                        </Grid>
                      ) : (
                        <Fragment>
                          <Grid item xs={6}>
                            <Button
                              variant="dark"
                              fullWidth
                              onClick={() =>
                                withdraw(currentPortal, "available")
                              }
                              disabled={currentPortal.availableStakeAmount <= 0}
                            >
                              <Tooltip
                                title={`${currentPortal.availableStakeAmount} XIO`}
                              >
                                <span>
                                  AVAILABLE
                                  <br />(
                                  {trunc(
                                    currentPortal.availableStakeAmount
                                  )}{" "}
                                  XIO)
                                </span>
                              </Tooltip>
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              variant="red"
                              fullWidth
                              onClick={() => setDialogStep("earlyWithdraw")}
                              disabled={currentPortal.totalStakeAmount <= 0}
                            >
                              <Tooltip title={`${maxAmount} XIO`}>
                                <span>
                                  MAX
                                  <br />({trunc(maxAmount)} XIO)
                                </span>
                              </Tooltip>
                            </Button>
                          </Grid>
                        </Fragment>
                      )
                    ) : (
                      <Grid item xs={12}>
                        <Button
                          variant="red"
                          fullWidth
                          onClick={() => withdraw(currentPortal, "available")}
                          disabled={currentPortal.availableStakeAmount <= 0}
                        >
                          <Tooltip
                            title={`${currentPortal.availableStakeAmount} XIO`}
                          >
                            <span>
                              CONFIRM WITHDRAW
                              {/* ({trunc(currentPortal.availableStakeAmount)} XIO) */}
                            </span>
                          </Tooltip>
                        </Button>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Accordion className={classes.withdrawAccordian}>
                        <AccordionSummary
                          aria-controls="panel1d-content"
                          id="panel1d-header"
                          className={classes.accordionSummary}
                        >
                          <Typography className={classes.withdrawText}>
                            WITHDRAW SPECIFIC XIO AMOUNT
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.AccordionDetails}>
                          <TextField
                            className={
                              currentPortal.totalStakeAmount <= 0 ||
                              parseFloat(partialWithdraw) >
                                currentPortal.totalStakeAmount ||
                              !(parseFloat(partialWithdraw) > 0)
                                ? classes.withdrawTextField2
                                : classes.withdrawTextField
                            }
                            fullWidth
                            placeholder="0"
                            value={partialWithdraw}
                            onChange={handleChange}
                            type="number"
                            inputMode="numeric"
                            pattern={regex}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => (e.target.placeholder = "")}
                            onBlur={(e) => (e.target.placeholder = "0")}
                          />

                          <Button
                            variant="red"
                            fullWidth
                            onClick={() => setDialogStep("earlyWithdrawCustom")}
                            disabled={
                              currentPortal.totalStakeAmount <= 0 ||
                              parseFloat(partialWithdraw) >
                                currentPortal.totalStakeAmount ||
                              !(parseFloat(partialWithdraw) > 0)
                            }
                          >
                            <Tooltip title={`${partialWithdraw} XIO`}>
                              <span>
                                WITHDRAW
                                <br />({trunc(partialWithdraw)} XIO)
                              </span>
                            </Tooltip>
                          </Button>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  </Grid>
                </Fragment>
              ),
              confirmSelectedWithdraw: (
                <Fragment>
                  <Typography variant="body1">
                    WITHDRAW{" "}
                    <Tooltip
                      title={`${selectedStakesWithdrawValues.amount} XIO`}
                    >
                      <span className={classes.redText}>
                        {trunc(selectedStakesWithdrawValues.amount)} XIO
                      </span>
                    </Tooltip>{" "}
                    FROM SELECTED STAKES?
                  </Typography>
                  <Grid item xs={12}>
                    <Button
                      variant="red"
                      fullWidth
                      onClick={() =>
                        withdrawSpecificStakes(_selectedStakesWtihdraw)
                      }
                      disabled={!(selectedStakesWithdrawValues.amount > 0)}
                    >
                      CONFIRM
                    </Button>
                  </Grid>
                </Fragment>
              ),
              confirmSelectedWithdrawBurn: (
                <Fragment>
                  <Typography variant="body1">
                    IF YOU WITHDRAW{" "}
                    <Tooltip
                      title={`${selectedStakesWithdrawValues.maxAmount} XIO`}
                    >
                      <span className={classes.greenText}>
                        {trunc(selectedStakesWithdrawValues.maxAmount)} XIO
                      </span>
                    </Tooltip>{" "}
                    NOW FROM SELECTED STAKES, YOU WILL PAY A{" "}
                    <Tooltip title={`${selectedStakesWithdrawValues.burn} XIO`}>
                      <span className={classes.redText}>
                        {trunc(selectedStakesWithdrawValues.burn)} XIO
                      </span>
                    </Tooltip>{" "}
                    FEE IN THE PROCESS
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Button
                        variant="red"
                        fullWidth
                        onClick={() =>
                          withdrawSpecificStakes(
                            _selectedStakesWtihdraw,
                            selectedStakesWithdrawValues.maxAmount
                          )
                        }
                        disabled={!(selectedStakesWithdrawValues.amount > 0)}
                      >
                        CONFIRM
                      </Button>
                    </Grid>
                  </Grid>
                </Fragment>
              ),
              earlyWithdraw: (
                <Fragment>
                  <Typography variant="body1">
                    IF YOU WITHDRAW{" "}
                    <Tooltip title={`${maxAmount} XIO`}>
                      <span className={classes.greenText}>
                        {trunc(maxAmount)} XIO
                      </span>
                    </Tooltip>{" "}
                    NOW, YOU WILL PAY A{" "}
                    <Tooltip title={`${burn} XIO`}>
                      <span className={classes.redText}>{trunc(burn)} XIO</span>
                    </Tooltip>{" "}
                    FEE IN THE PROCESS
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        variant="dark"
                        fullWidth
                        onClick={() => setDialogStep("selectWithdrawType")}
                      >
                        BACK
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="red"
                        fullWidth
                        onClick={() => withdraw(currentPortal, "max")}
                      >
                        CONFIRM
                      </Button>
                    </Grid>
                  </Grid>
                </Fragment>
              ),
              earlyWithdrawCustom: (
                <Fragment>
                  <Typography variant="body1">
                    IF YOU WITHDRAW{" "}
                    <Tooltip title={`${maxPartialWithdraw} XIO`}>
                      <span className={classes.greenText}>
                        {trunc(maxPartialWithdraw)} XIO
                      </span>
                    </Tooltip>{" "}
                    NOW, YOU WILL PAY A{" "}
                    <Tooltip title={`${burnPartialWithdraw} XIO`}>
                      <span className={classes.redText}>
                        {trunc(burnPartialWithdraw)} XIO
                      </span>
                    </Tooltip>{" "}
                    FEE IN THE PROCESS
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        variant="dark"
                        fullWidth
                        onClick={() => setDialogStep("selectWithdrawType")}
                      >
                        BACK
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="red"
                        fullWidth
                        onClick={() =>
                          withdraw(currentPortal, "partial", partialWithdraw)
                        }
                      >
                        CONFIRM
                      </Button>
                    </Grid>
                  </Grid>
                </Fragment>
              ),
              pending: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    TRANSACTION PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    WITHDRAWING
                    <br />
                    <Tooltip
                      title={`${withdrawRequest.quantity} ${withdrawRequest.symbol}`}
                    >
                      <span>
                        {trunc(withdrawRequest.quantity)}{" "}
                        {withdrawRequest.symbol}
                      </span>
                    </Tooltip>
                  </Typography>
                </Fragment>
              ),
              failed: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    TRANSACTION
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejected: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    TRANSACTION
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              success: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    TRANSACTION
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY WITHDRAWN{" "}
                    <Tooltip
                      title={`${withdrawRequest.quantity} ${withdrawRequest.symbol}`}
                    >
                      <span>
                        {trunc(withdrawRequest.quantity)}{" "}
                        {withdrawRequest.symbol}
                      </span>
                    </Tooltip>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${withdrawTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      VIEW ON ETHERSCAN
                    </a>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
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
  web3: { active, account },
  dashboard,
  ui: {
    loading: { data },
  },
  user: { currentStaked },
  flashstake: { balance },
}) => ({
  active,
  account,
  balance,
  ...dashboard,
  loadingData: data,
  currentStaked,
});

export default connect(mapStateToProps, {
  setLoading,
  getDashboardProps,
  setDialogStep,
  withdraw,
  setRefetch,
  showWalletBackdrop,
  setReCalculateExpired,
  toggleAccordianExpanded,
  withdrawSpecificStakes,
})(Dashboard);
