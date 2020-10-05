import React, { useEffect, useState, Fragment, useCallback } from "react";
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
  IconButton,
  Tooltip,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQuery } from "@apollo/client";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";

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
  getApproval,
  calculateReward,
  checkAllowance,
  getBalance,
  stake,
  setDialogStep,
  setReset,
  setInitialValues,
} from "../../redux/actions/flashstakeActions";
import { debounce } from "../../utils/debounceFunc";
import { getExtendedFloatValue, trunc } from "../../utils/utilFunc";
import { setLoading, showWalletBackdrop } from "../../redux/actions/uiActions";
import MaxBtn from "../../component/MaxBtn";
import { Link } from "@material-ui/icons";
// import maxbtn from "../../assets/maxbtn.svg";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { JSBI } from "@uniswap/sdk";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    // padding: theme.spacing(4, 0),
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",

    // height: "200px",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: 10,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: 8,
    },
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
    fontSize: 10,
    color: theme.palette.xioRed.main,
  },
  infoText: {
    fontSize: 10,
    color: theme.palette.text.secondary,
  },
  infoTextSpan: {
    fontSize: 10,
    fontWeight: 900,
    color: "#fff",
    position: "relative",
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  textBold: {
    fontWeight: 700,
  },
  xIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 900,
    marginTop: 28,
    fontSize: 15,
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
    transform: "translateY(-50%)",
    background: theme.palette.background.secondary,
    "&.Mui-disabled": {
      display: "none",
    },
    "& svg": {
      fill: "#9191A7",
    },
    "&:hover": {
      background: theme.palette.background.primary,
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
    fontSize: 11,
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
    backgroundColor: "#1A1A1A",
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
    backgroundColor: "#1A1A1A",
    padding: "0 !important",

    "& .MuiAccordionSummary-content": {
      display: "block",
      margin: 0,
    },
  },
  accordion: {
    backgroundColor: "#1A1A1A",
  },
  stakeDashBtn: {
    color: theme.palette.text.grey,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2,
  },
  icon: {
    color: theme.palette.text.grey,

    "&:hover": {
      color: "#fff",
    },
  },
  accordionDetails: {
    borderBottom: `1px solid ${theme.palette.border.secondary} !important`,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.palette.text.gray,
    borderBottomLeftRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  loaderStyle: {
    position: "absolute",
    left: 2,
    top: "10%",
  },
}));

const Accordion = withStyles({
  root: {
    // border: "1px solid rgba(0, 0, 0, .125)",
    backgroundColor: "#121212",
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
})(MuiAccordion);

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

function Flashstake({
  getFlashstakeProps,
  stakeTokens,
  rewardTokens,
  selectedStakeToken,
  selectedRewardToken,
  setSelectedStakeToken,
  setSelectedRewardToken,
  selectedPortal,
  allowance,
  getApproval,
  calculateReward,
  reward,
  loading: loadingRedux,
  active,
  account,
  checkAllowance,
  getBalance,
  balance,
  stake,
  setLoading,
  dialogStep,
  setDialogStep,
  stakeRequest,
  reset,
  setReset,
  chainId,
  stakeTxnHash,
  setInitialValues,
  initialValues,
  showWalletBackdrop,
  portals,
  currentStaked,
  pools,
}) {
  const classes = useStyles();
  const web3context = useWeb3React();

  const [inputError, setInputError] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [checked, setChecked] = useState(
    localStorage.getItem("restake") === "true"
  );
  const [additionalContractBal, setAdditionalContractBal] = useState(0);

  const [expanded, setExpanded] = useState("panel1");
  const [expanded2, setExpanded2] = useState(true);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const toggleChecked = useCallback(() => {
    setChecked(!checked);
    localStorage.setItem("restake", !checked);
  }, [checked, setChecked]);

  const debouncedCalculateReward = useCallback(
    debounce(calculateReward, 200),
    []
  );

  const [days, setDays] = useState(initialValues.days);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const [renderDualButtons, setRenderDualButtons] = useState(false);
  const regex = /^\d*(.(\d{1,18})?)?$/;

  //#region functions

  const onChangeDays = ({ target: { value } }) => {
    if (Number(value) || value === "" || value === "0") {
      setDays(parseInt(value) || value);
    } else {
      setDays((val) => val);
    }
  };
  const onChangeQuantity = ({ target: { value } }) => {
    if (Number(value) || value === "" || /^[0]?[.]?$/.test(value)) {
      if (regex.test(value)) {
        // console.log(value, regex.test(value));
        setQuantity(
          value[value.length - 1] === "." || !Number(value) ? value : value
        );
      }
      // console.log(value, regex.test(value), quantity);
    } else {
      setQuantity((val) => val);
    }
  };

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    document.title = "Flashstake - XIO | The Future is at Stake";
    // setLoading({ dapp: true });
  }, []);

  useEffect(() => {
    console.log("heloooooooooooooo");
  }, [quantity, days]);

  useEffect(() => {
    if (selectedPortal && !allowance) {
      setRenderDualButtons(true);
    }
  }, [selectedPortal, allowance]);

  useEffect(() => () => setInitialValues(quantity, days), [
    days,
    quantity,
    setInitialValues,
  ]);

  useEffect(() => {
    if (reset) {
      getBalance();
      setDays("");
      setQuantity("");
      setReset(false);
    }
  }, [reset, setReset, getBalance]);

  useEffect(() => {
    if (selectedPortal) {
      debouncedCalculateReward(quantity, days);
      console.log("hello");
      const _rewardRefreshInterval = setInterval(() => {
        // console.log("Reward updated.");
        debouncedCalculateReward(quantity, days);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [setLoading, selectedPortal, days, quantity, debouncedCalculateReward]);

  useEffect(() => {
    let _additionalContractBal = parseFloat(balance);
    if (checked && currentStaked.availableStakeAmount > 0) {
      _additionalContractBal += parseFloat(currentStaked.availableStakeAmount);
    }
    setAdditionalContractBal(_additionalContractBal);

    setInputError(
      (active || account) && parseFloat(quantity) > _additionalContractBal
    );
  }, [
    active,
    account,
    balance,
    days,
    quantity,
    selectedPortal,
    checked,
    currentStaked.availableStakeAmount,
  ]);

  useEffect(() => {
    if (active && account) {
      checkAllowance();
      getBalance();
      showWalletBackdrop(false);
    }
  }, [active, account, checkAllowance, getBalance, showWalletBackdrop]);

  const onClickStake = (quantity, days) => {
    setDialogStep("pendingStake");
    setShowStakeDialog(true);
    stake(quantity, days);
  };

  const onClickApprove = () => {
    setDialogStep("pendingApproval");
    setShowStakeDialog(true);
    getApproval();
  };

  const onClickClose = () => {
    setReset(true);
    setShowStakeDialog(false);
  };

  const closeDialog = () => {
    setShowStakeDialog(false);
  };

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
  };

  //#endregion
  // console.log(expanded2);
  return (
    <PageAnimation in={true} reverse>
      <Fragment>
        <Box className={classes.contentContainer}>
          <Accordion
            square
            expanded={expanded2}
            onChange={handleChange("panel1")}
          >
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
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="h6" className={classes.secondaryText}>
                    WHAT TOKEN DO YOU WANT TO EARN
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
                      STAKE QUANTITY
                    </Typography>
                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        error={
                          active &&
                          account &&
                          parseFloat(quantity) > additionalContractBal
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
                      {/* <IconButton
                    className={classes.maxIconButton}
                    disabled={
                      !(active || account) || quantity == getMaxQuantity()
                    }
                    onClick={setMaxQuantity}
                  >
                    <MaxBtn width={10} />
                  </IconButton> */}
                    </Box>
                  </Box>

                  <Typography variant="body2" className={classes.xIcon}>
                    +
                  </Typography>
                  <Box flex={1}>
                    <Typography
                      variant="body2"
                      className={classes.secondaryText}
                    >
                      STAKE DURATION
                    </Typography>

                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        fullWidth
                        placeholder="0"
                        value={days}
                        onChange={onChangeDays}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => (e.target.placeholder = "0")}
                      />
                      {/* <IconButton
                    className={classes.maxIconButton}
                    disabled={!(active || account) || days == getMaxDays()}
                    onClick={() => setDays(getMaxDays())}
                  >
                    <MaxBtn width={10} />
                  </IconButton> */}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  {chainId === 4 &&
                    (selectedRewardToken?.tokenB?.symbol ? (
                      <Typography variant="h6" className={classes.infoText}>
                        IF YOU STAKE{" "}
                        <span className={classes.infoTextSpan}>
                          {quantity || 0} XIO{" "}
                        </span>{" "}
                        FOR{" "}
                        <span className={classes.infoTextSpan}>
                          {days || 0} DAYS
                        </span>{" "}
                        YOU WILL IMMEDIATELY GET{" "}
                        <Tooltip
                          title={`${Web3.utils.fromWei(reward)} ${
                            selectedRewardToken?.tokenB?.symbol || ""
                          }`}
                        >
                          <span className={classes.infoTextSpan}>
                            {loadingRedux.reward ? (
                              <CircularProgress
                                size={12}
                                className={classes.loaderStyle}
                              />
                            ) : (
                              trunc(Web3.utils.fromWei(reward))
                            )}

                            {/* {selectedRewardToken?.tokenB?.symbol || ""} */}
                          </span>
                        </Tooltip>
                      </Typography>
                    ) : (
                      <Typography variant="body2" className={classes.redText}>
                        SELECT A TOKEN TO VIEW REWARDS
                      </Typography>
                    ))}

                  {/* <Box className={classes.btn}>
                    {!(active && account) ? (
                      <Grid
                        item
                        xs={12}
                        className={`${classes.msgContainer} ${classes.cursorPointer}`}
                        onClick={showWalletHint}
                      >
                        <Typography variant="body2" className={classes.redText}>
                          CONNECT YOUR WALLET TO VIEW YOUR STAKES
                        </Typography>
                      </Grid>
                    ) : chainId !== 4 ? (
                      <Grid item xs={12} className={classes.msgContainer}>
                        <Typography variant="body2" className={classes.redText}>
                          CHANGE NETWORK TO RINKEBY TO WITHDRAW TOKENS
                        </Typography>
                      </Grid>
                    ) : (
                      <Button
                        variant="red"
                        onClick={
                          !allowance
                            ? () => {}
                            : () => onClickStake(quantity, days)
                        }
                      >
                        FLASHSTAKE
                      </Button>
                    )}
                  </Box> */}
                </Grid>

                {!allowance || renderDualButtons ? (
                  <Grid container item xs={12} onClick={showWalletHint}>
                    <Grid item xs={6} className={classes.btnPaddingRight}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={!allowance ? onClickApprove : () => {}}
                        disabled={
                          allowance ||
                          !active ||
                          !account ||
                          // inputError ||
                          // quantity <= 0 ||
                          // days <= 0 ||
                          // reward <= 0 ||
                          // !selectedPortal ||
                          // loadingRedux.reward ||
                          chainId !== 4
                        }
                        loading={loadingRedux.approval}
                      >
                        {loadingRedux.approval
                          ? "APPROVING"
                          : `APPROVE ${selectedStakeToken}`}
                      </Button>
                    </Grid>
                    <Grid item xs={6} className={classes.btnPaddingLeft}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={
                          !allowance
                            ? () => {}
                            : () => onClickStake(quantity, days, checked)
                        }
                        disabled={
                          !allowance ||
                          !active ||
                          !account ||
                          inputError ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          chainId !== 4 ||
                          reward <= 0
                        }
                      >
                        FLASHSTAKE
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Fragment>
                    <Grid container item xs={12} onClick={showWalletHint}>
                      <Button
                        fullWidth
                        variant="red"
                        onClick={
                          !allowance
                            ? () => {}
                            : () => onClickStake(quantity, days, checked)
                        }
                        disabled={
                          !active ||
                          !account ||
                          inputError ||
                          !selectedPortal ||
                          quantity <= 0 ||
                          days <= 0 ||
                          loadingRedux.reward ||
                          chainId !== 4 ||
                          reward <= 0
                        }
                        loading={loadingRedux.approval}
                      >
                        FLASHSTAKE
                      </Button>
                    </Grid>
                  </Fragment>
                )}

                {!allowance &&
                active &&
                account &&
                selectedRewardToken &&
                !loadingRedux.allowance ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" className={classes.redText}>
                      BEFORE YOU CAN <b>FLASHSTAKE</b>, YOU MUST{" "}
                      <b>APPROVE XIO</b>
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
                      CONNECT YOUR WALLET TO FLASHSTAKE
                    </Typography>
                  </Grid>
                ) : chainId !== 4 ||
                  web3context.error instanceof UnsupportedChainIdError ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" className={classes.redText}>
                      CHANGE NETWORK TO <b>RINKEBY</b> TO START{" "}
                      <b>FLASHSTAKING</b>
                    </Typography>
                  </Grid>
                ) : null}

                {/*   
          
            {selectedPortal ? (
              <Grid item xs={12}>
                <Typography variant="body2" className={classes.secondaryText}>
                  FLASHSTAKE AND GET{" "}
                  {loadingRedux.reward ? (
                    <CircularProgress
                      size={12}
                      className={classes.loaderStyle}
                    />
                  ) : (
                    <Tooltip
                      title={`${getExtendedFloatValue(
                        reward
                      )} ${selectedRewardToken}`}
                    >
                      <span className={classes.redText}>
                        {trunc(reward)} {selectedRewardToken}
                      </span>
                    </Tooltip>
                  )}{" "}
                  INSTANTLY
                </Typography>
              </Grid>
            ) : null}

            {!allowance || renderDualButtons ? (
              <Grid container item xs={12} onClick={showWalletHint}>
                <Grid item xs={6} className={classes.btnPaddingRight}>
                  <Button
                    fullWidth
                    variant="red"
                    onClick={!allowance ? onClickApprove : () => {}}
                    disabled={
                      allowance ||
                      !active ||
                      !account ||
                      // inputError ||
                      // quantity <= 0 ||
                      // days <= 0 ||
                      // reward <= 0 ||
                      // !selectedPortal ||
                      // loadingRedux.reward ||
                      chainId !== 4
                    }
                    loading={loadingRedux.approval}
                  >
                    {loadingRedux.approval
                      ? "APPROVING"
                      : `APPROVE ${selectedStakeToken}`}
                  </Button>
                </Grid>
                <Grid item xs={6} className={classes.btnPaddingLeft}>
                  <Button
                    fullWidth
                    variant="red"
                    onClick={
                      !allowance
                        ? () => {}
                        : () => onClickStake(quantity, days, checked)
                    }
                    disabled={
                      !allowance ||
                      !active ||
                      !account ||
                      inputError ||
                      !selectedPortal ||
                      quantity <= 0 ||
                      days <= 0 ||
                      loadingRedux.reward ||
                      chainId !== 4 ||
                      reward <= 0
                    }
                  >
                    FLASHSTAKE
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Fragment>
                <Grid container item xs={12} onClick={showWalletHint}>
                  <Button
                    fullWidth
                    variant="red"
                    onClick={
                      !allowance
                        ? () => {}
                        : () => onClickStake(quantity, days, checked)
                    }
                    disabled={
                      !active ||
                      !account ||
                      inputError ||
                      !selectedPortal ||
                      quantity <= 0 ||
                      days <= 0 ||
                      loadingRedux.reward ||
                      chainId !== 4 ||
                      reward <= 0
                    }
                    loading={loadingRedux.approval}
                  >
                    FLASHSTAKE
                  </Button>
                </Grid>
              </Fragment>
            )}
            {currentStaked.availableStakeAmount > 0 && quantity > 0 ? (
              <Grid item xs={12} className={classes.restakeableXio}>
                <Typography
                  className={classes.restakeText}
                  onClick={toggleChecked}
                >
                  <Checkbox
                    checked={checked}
                    // onClick={() => setChecked((val) => !val)}
                    className={classes.checkbox}
                    size="small"
                  />{" "}
                  USE{" "}
                  {currentStaked.availableStakeAmount > parseFloat(quantity)
                    ? quantity
                    : currentStaked.availableStakeAmount}{" "}
                  XIO FROM YOUR AVAILABLE DAPP BALANCE
                </Typography>
              </Grid>
            ) : null}
            {!allowance &&
            active &&
            account &&
            selectedRewardToken &&
            !loadingRedux.allowance ? (
              <Grid item xs={12}>
                <Typography variant="body2" className={classes.redText}>
                  BEFORE YOU CAN <b>FLASHSTAKE</b>, YOU MUST <b>APPROVE XIO</b>
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
                  CONNECT YOUR WALLET TO FLASHSTAKE
                </Typography>
              </Grid>
            ) : chainId !== 4 ||
              web3context.error instanceof UnsupportedChainIdError ? (
              <Grid item xs={12}>
                <Typography variant="body2" className={classes.redText}>
                  CHANGE NETWORK TO <b>RINKEBY</b> TO START <b>FLASHSTAKING</b>
                </Typography>
              </Grid>
            ) : null}
          </Grid>
        </Box>


        
      
          </Fragment>
       */}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion
            square
            expanded={!expanded2}
            onChange={handleChange("panel2")}
          >
            <AccordionSummary
              aria-controls="panel2d-content"
              id="panel2d-header"
              onClick={() => setExpanded2(!expanded2)}
              className={expanded2 ? classes.btn3 : classes._btn3}
            >
              {expanded2 ? (
                <ArrowDropUpIcon size="large" className={classes.icon} />
              ) : (
                <ArrowDropDownIcon size="large" className={classes.icon} />
              )}
              <Typography className={classes.stakeDashBtn}>
                STAKE DASHBOARD
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordion}>
              <Table />
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* 


        <Dialog
          // open={showStakeDialog}
          open={true}
          title="FLASHSTAKE"
          onClose={() => setShowStakeDialog(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep.includes(item)
          )}
          step={dialogStep}
          stepperShown={
            dialogStep === "pendingApproval" ||
            dialogStep === "flashstakeProposal"
          }

          // status="success"
        >
          {
            {
              pendingApproval: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    APPROVAL PENDING
                    <br />
                  </Typography>
                </Fragment>
              ),
              flashstakeProposal: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    FLASHSTAKE
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    {quantity} {selectedStakeToken} FOR {days}{" "}
                    {days > 1 ? "DAYS" : "DAY"} TO EARN{" "}
                    <Tooltip
                      title={`${getExtendedFloatValue(
                        reward
                      )} ${selectedRewardToken}`}
                    >
                      <span>
                        {trunc(reward)} {selectedRewardToken}
                      </span>
                    </Tooltip>{" "}
                    INSTANTLY
                  </Typography>
                  <Button
                    variant="red"
                    fullWidth
                    onClick={
                      !allowance
                        ? () => {}
                        : () => onClickStake(quantity, days, checked)
                    }
                    disabled={
                      !active ||
                      !account ||
                      inputError ||
                      !selectedPortal ||
                      quantity <= 0 ||
                      days <= 0 ||
                      loadingRedux.reward ||
                      chainId !== 4 ||
                      reward <= 0
                    }
                    loading={loadingRedux.approval}
                  >
                    FLASHSTAKE
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
                  <Button variant="red" fullWidth onClick={closeDialog}>
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
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              pendingStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    FLASHSTAKE PENDING
                    <br />
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    {stakeRequest.quantity} {stakeRequest.tokenA} FOR{" "}
                    {stakeRequest.days} {stakeRequest.days > 1 ? "DAYS" : "DAY"}{" "}
                    TO EARN{" "}
                    <Tooltip
                      title={`${stakeRequest.reward} ${stakeRequest.tokenB}`}
                    >
                      <span>
                        {trunc(stakeRequest.reward)} {stakeRequest.tokenB}
                      </span>
                    </Tooltip>{" "}
                    INSTANTLY
                  </Typography>
                </Fragment>
              ),
              failedStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    FLASHSTAKE
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    FLASHSTAKE
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="red" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successStake: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    FLASHSTAKE
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    YOU HAVE SUCCESSFULLY STAKED {stakeRequest.quantity}{" "}
                    {stakeRequest.tokenA} FOR {stakeRequest.days}{" "}
                    {stakeRequest.days > 1 ? "DAYS" : "DAY"} AND YOU WERE SENT{" "}
                    <Tooltip
                      title={`${stakeRequest.reward} ${stakeRequest.tokenB}`}
                    >
                      <span>
                        {trunc(stakeRequest.reward)} {stakeRequest.tokenB}
                      </span>
                    </Tooltip>
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://rinkeby.etherscan.io/tx/${stakeTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      VIEW ON ETHERSCAN
                    </a>
                  </Typography>
                  <Button variant="red" fullWidth onClick={onClickClose}>
                    CLOSE
                  </Button>
                </Fragment>
              ),
            }[dialogStep]
          }
        </Dialog>
     
      */}
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading },
  web3: { active, account, chainId },
  user: { currentStaked, pools },
  contract,
}) => ({
  ...flashstake,
  loading,
  active,
  account,
  chainId,
  pools,
  currentStaked,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApproval,
  calculateReward,
  checkAllowance,
  getBalance,
  stake,
  setLoading,
  setDialogStep,
  setReset,
  setInitialValues,
  showWalletBackdrop,
})(Flashstake);
