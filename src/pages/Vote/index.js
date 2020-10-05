import React, { useEffect, useState, Fragment, useCallback } from "react";
import Web3 from "web3";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";

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

import { Button, DropdownDialog, Dialog, PageAnimation } from "../../component";
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
    padding: theme.spacing(4),
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    // height: "200px",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: 8,
    marginBottom: theme.spacing(1),
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
  comingSoon: {
    color: theme.palette.xioRed.main,
  },
}));

function Vote({
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
  maxDays,
  maxStake,
  currentStaked,
}) {
  const classes = useStyles();
  const web3context = useWeb3React();

  const [inputError, setInputError] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [checked, setChecked] = useState(
    localStorage.getItem("restake") === "true"
  );
  const [additionalContractBal, setAdditionalContractBal] = useState(0);

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

  const onChangeDays = ({ target: { value } }) => {
    if (Number(value) || value === "" || value === "0") {
      if (value <= 200) {
        setDays(parseInt(value) || value);
      }
    } else {
      setDays((val) => val);
    }
  };
  const onChangeQuantity = ({ target: { value } }) => {
    if (Number(value) || value === "" || /^[0]?[.]?$/.test(value)) {
      if (value <= 800 && regex.test(value)) {
        console.log(value, regex.test(value));
        setQuantity(
          value[value.length - 1] === "." || !Number(value) ? value : value
        );
      }
      console.log(value, regex.test(value), quantity);
    } else {
      setQuantity((val) => val);
    }
  };
  const getMaxDays = useCallback(() => {
    return maxDays;
  }, [maxDays]);

  const getMaxQuantity = useCallback(() => {
    // let _additionalContractBal = JSBI.BigInt(0);
    // _additionalContractBal = Web3.utils.fromWei(
    //   JSBI.add(
    //     JSBI.BigInt(Web3.utils.toWei(balance?.toString())),
    //     JSBI.BigInt(
    //       Web3.utils.toWei(currentStaked?.availableStakeAmount?.toString()) ||
    //         "0"
    //     )
    //   ).toString()
    // );
    // let _additionalContractBal =
    //   balance + parseFloat(currentStaked.availableStakeAmount || "0");
    let _additionalContractBal = Web3.utils.fromWei(
      JSBI.add(
        JSBI.BigInt(Web3.utils.toWei(balance.toString())),
        JSBI.BigInt(
          Web3.utils.toWei(currentStaked?.availableStakeAmount || "0")
        )
      ).toString()
    );

    // if (checked && currentStaked.availableStakeAmount > 0) {
    //   _additionalContractBal += parseFloat(currentStaked.availableStakeAmount);
    // }
    return parseFloat(Web3.utils.fromWei(maxStake)) > _additionalContractBal &&
      active &&
      account
      ? _additionalContractBal
      : Web3.utils.fromWei(maxStake);
  }, [balance, maxStake, active, account, currentStaked.availableStakeAmount]);

  const setMaxQuantity = useCallback(() => {
    setQuantity(getMaxQuantity());
    if (!checked) {
      toggleChecked();
    }
  }, [getMaxQuantity, checked, toggleChecked]);

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

      const _rewardRefreshInterval = setInterval(() => {
        console.log("Reward updated.");
        debouncedCalculateReward(quantity, days, true);
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
      (active || account) &&
        (parseFloat(quantity) > Web3.utils.fromWei(maxStake) ||
          parseFloat(days) > maxDays ||
          parseFloat(quantity) > _additionalContractBal)
    );
  }, [
    active,
    account,
    balance,
    days,
    quantity,
    selectedPortal,
    maxStake,
    maxDays,
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

  const onClickStake = (quantity, days, restake) => {
    setDialogStep("pendingStake");
    setShowStakeDialog(true);
    stake(quantity, days, restake);
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
  const [soon, setSoon] = useState(true);

  return (
    <PageAnimation in={true}>
      <Fragment>
        <Box className={classes.contentContainer}>
          {soon ? (
            <Typography variant="h5" className={classes.comingSoon}>
              COMING SOON
            </Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid container item xs={12}>
                <Box flex={1}>
                  <Typography variant="body2" className={classes.secondaryText}>
                    AVAILABLE XVT
                  </Typography>
                  <Box className={classes.textFieldContainer}>
                    <TextField
                      className={classes.textField}
                      error={
                        (active &&
                          account &&
                          parseFloat(quantity) > additionalContractBal) ||
                        (maxStake &&
                          parseFloat(quantity) > Web3.utils.fromWei(maxStake))
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

                <Typography
                  variant="body2"
                  className={classes.xIcon}
                ></Typography>
                <Box flex={1}>
                  <Typography variant="body2" className={classes.secondaryText}>
                    LOCKED SVT
                  </Typography>

                  <Box className={classes.textFieldContainer}>
                    <TextField
                      className={classes.textField}
                      error={parseFloat(days) > maxDays}
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

              <Grid container item xs={12}>
                <Box flex={1}>
                  <Typography variant="body2" className={classes.secondaryText}>
                    WHICH POLICY WOULD YOU LIKE TO VOTE FOR
                  </Typography>
                  <Box className={classes.textFieldContainer}>
                    <TextField
                      className={classes.textField}
                      error={
                        (active &&
                          account &&
                          parseFloat(quantity) > additionalContractBal) ||
                        (maxStake &&
                          parseFloat(quantity) > Web3.utils.fromWei(maxStake))
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
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" className={classes.secondaryText}>
                  HOW MANY VOTES WOULD YOU LIKE TO USE
                </Typography>
                <DropdownDialog
                  className={classes.dropDown}
                  items={portals}
                  selectedValue={selectedRewardToken}
                  onSelect={setSelectedRewardToken}
                  heading="ETH"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" className={classes.infoText}>
                  YOU ARE ABOUT TO VOTE FOR
                  <span className={classes.infoTextSpan}>
                    {" "}
                    POLICY 23{" "}
                  </span> WITH{" "}
                  <span className={classes.infoTextSpan}> 5,000 XTV </span>
                </Typography>
                <Box className={classes.btn}>
                  <Button variant="red">VOTE</Button>
                </Box>
              </Grid>
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


        <Dialog
          open={showStakeDialog}
          // open={true}
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
      
          </Fragment>
       */}
            </Grid>
          )}
        </Box>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading },
  web3: { active, account, chainId },
  user: { currentStaked },
  contract,
}) => ({
  ...flashstake,
  loading,
  active,
  account,
  chainId,
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
})(Vote);
