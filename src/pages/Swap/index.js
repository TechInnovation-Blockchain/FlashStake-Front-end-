import React, { useEffect, useState, Fragment, useCallback } from "react";
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

import {
  Button,
  DropdownDialog,
  Dialog,
  PageAnimation,
  SwapTable,
} from "../../component";
import {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalALT,
  calculateReward,
  checkAllowanceALT,
  calculateSwap,
  getBalanceALT,
  setDialogStep,
  setReset,
  setInitialValues,
  swapALT,
} from "../../redux/actions/flashstakeActions";
import { setExpandAccodion } from "../../redux/actions/uiActions";
import { setRefetch } from "../../redux/actions/dashboardActions";
import { debounce } from "../../utils/debounceFunc";
import { trunc } from "../../utils/utilFunc";
import { Link } from "@material-ui/icons";
import MaxBtn from "../../component/MaxBtn";

import { setLoading, showWalletBackdrop } from "../../redux/actions/uiActions";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    // height: "200px",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    // fontSize: 10,
    marginBottom: theme.spacing(1),
    // [theme.breakpoints.down("xs")]: {
    // fontSize: 8,
    // },
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
    // fontSize: 10,
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  infoText: {
    // fontSize: 10,
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  infoTextSpan: {
    // fontSize: 10,
    color: theme.palette.xioRed.main,
    fontWeight: 900,
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
      color: "#c66065",
    },
  },
  accordion: {
    backgroundColor: theme.palette.background.secondary,
  },
  stakeDashBtn: {
    color: "inherit",
    fontWeight: 700,
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
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
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

function Swap({
  getFlashstakeProps,
  stakeTokens,
  rewardTokens,
  selectedStakeToken,
  selectedRewardToken,
  balanceALT,
  setSelectedStakeToken,
  setSelectedRewardToken,
  selectedPortal,
  allowanceALT,
  getApprovalALT,
  calculateReward,
  calculateSwap,
  reward,
  swapOutput,
  loading: loadingRedux,
  active,
  account,
  checkAllowanceALT,
  getBalanceALT,
  balance,
  setLoading,
  dialogStep2,
  setDialogStep,
  stakeRequest,
  reset,
  setReset,
  setRefetch,
  chainId,
  stakeTxnHash,
  setInitialValues,
  initialValues,
  showWalletBackdrop,
  portals,
  maxDays,
  maxStake,
  currentStaked,
  swapHist,
  pools,
  swapALT,
  setExpandAccodion,
  expanding,
  animation,
  ...props
}) {
  const classes = useStyles();
  const [showStakeDialog, setShowStakeDialog] = useState(false);

  const [expanded2, setExpanded2] = useState(true);

  const debouncedCalculateSwap = useCallback(debounce(calculateSwap, 500), []);

  const [days, setDays] = useState(initialValues.days);
  const [quantity, setQuantity] = useState("");
  const regex = /^[0-9]*[.]?[0-9]*$/;

  const onChangeQuantity = ({ target: { value } }) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
      setQuantity(value);
    }
    // if (Number(value) || value === "" || /^[0]?[.]?$/.test(value)) {
    //   if (regex.test(value)) {
    //     setQuantity(
    //       value[value.length - 1] === "." || !Number(value) ? value : value
    //     );
    //   }
    // } else {
    //   setQuantity((val) => val);
    // }
  };

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    document.title = "Swap - XIO | The Future is at Stake";
    setRefetch();
    // setLoading({ dapp: true });
  }, [setRefetch]);

  useEffect(() => () => setInitialValues(quantity, days), [
    days,
    quantity,
    setInitialValues,
  ]);

  useEffect(() => {
    if (reset) {
      getBalanceALT();
      setDays("");
      setQuantity("");
      setReset(false);
    }
  }, [reset, setReset, getBalanceALT]);

  useEffect(() => {
    getBalanceALT();
  }, [selectedPortal, getBalanceALT]);

  useEffect(() => {
    if (selectedPortal) {
      debouncedCalculateSwap(quantity);

      const _rewardRefreshInterval = setInterval(() => {
        // console.log("Reward updated.");
        debouncedCalculateSwap(quantity);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [setLoading, selectedPortal, quantity, debouncedCalculateSwap]);

  useEffect(() => {
    if (selectedPortal) {
      checkAllowanceALT();
    }
  }, [selectedPortal, checkAllowanceALT]);

  useEffect(() => {
    if (active && account) {
      checkAllowanceALT();
      getBalanceALT();
      showWalletBackdrop(false);
    }
  }, [active, account, checkAllowanceALT, getBalanceALT, showWalletBackdrop]);

  const onClickApprove = () => {
    setDialogStep("pendingApproval");
    setShowStakeDialog(true);
    getApprovalALT("swap");
  };

  const onClickSwap = (quantity) => {
    setDialogStep("pendingSwap");
    setShowStakeDialog(true);
    swapALT(quantity);
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

  useEffect(() => {
    if (!expanding) {
      setExpanded2(true);
      setTimeout(() => {
        setExpandAccodion(true);
      }, 500);
    }
  }, [expanding, setExpandAccodion]);
  return (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
        <Box className={classes.contentContainer}>
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
                <Grid item xs={12}>
                  <Typography
                    variant="overline"
                    className={classes.secondaryText}
                  >
                    WHAT DO YOU WANT TO SWAP FOR XIO
                  </Typography>
                  <DropdownDialog
                    className={classes.dropDown}
                    items={pools}
                    selectedValue={selectedRewardToken}
                    onSelect={setSelectedRewardToken}
                    heading="SELECT TOKEN"
                    type="swap"
                  />
                </Grid>
                <Grid container item xs={12}>
                  <Box flex={1}>
                    <Typography
                      variant="overline"
                      className={classes.secondaryText}
                    >
                      SWAP QUANTITY
                    </Typography>
                    <Box className={classes.textFieldContainer}>
                      <TextField
                        className={classes.textField}
                        error={
                          active &&
                          account &&
                          parseFloat(quantity) > parseFloat(balanceALT)
                        }
                        fullWidth
                        placeholder="0.0"
                        value={quantity}
                        onChange={onChangeQuantity}
                        // type="number"
                        // inputMode="numeric"
                        // pattern={regex}
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => (e.target.placeholder = "")}
                        onBlur={(e) => (e.target.placeholder = "0.0")}
                      />
                      <IconButton
                        className={classes.maxIconButton}
                        disabled={
                          !(active || account) ||
                          !selectedPortal ||
                          balanceALT == quantity
                        }
                        onClick={() =>
                          onChangeQuantity({ target: { value: balanceALT } })
                        }
                      >
                        <MaxBtn width={10} />
                      </IconButton>
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
                  {selectedRewardToken?.tokenB?.symbol ? (
                    <Typography variant="overline" className={classes.infoText}>
                      IF YOU SWAP{" "}
                      <Tooltip
                        title={`${quantity} ${
                          selectedRewardToken?.tokenB?.symbol || ""
                        }`}
                      >
                        <span className={classes.infoTextSpan}>
                          {trunc(quantity)}{" "}
                          {selectedRewardToken?.tokenB?.symbol || ""}
                        </span>
                      </Tooltip>{" "}
                      YOU WILL IMMEDIATELY{" "}
                      {/* <span className={classes.infoTextSpan}>IMMEDIATELY</span>{" "} */}
                      EARN{" "}
                      {loadingRedux.swapReward ? (
                        <CircularProgress
                          size={12}
                          className={classes.loaderStyle}
                        />
                      ) : (
                        <Tooltip title={`${swapOutput} XIO`}>
                          <span className={classes.infoTextSpan}>
                            {" "}
                            {trunc(swapOutput)} XIO
                          </span>
                        </Tooltip>
                      )}
                    </Typography>
                  ) : (
                    <Typography variant="overline" className={classes.redText}>
                      SELECT A TOKEN TO VIEW SWAP OUTPUT AMOUNT
                    </Typography>
                  )}

                  <Box className={classes.btn}>
                    {!allowanceALT ? (
                      <Grid
                        container
                        item
                        xs={12}
                        className={classes.msgContainer}
                      >
                        <Grid item xs={6} className={classes.btnPaddingRight}>
                          <Button
                            variant="red"
                            fullWidth
                            onClick={onClickApprove}
                            disabled={
                              !selectedPortal ||
                              chainId !== 4 ||
                              allowanceALT ||
                              loadingRedux.approval
                            }
                            loading={
                              loadingRedux.approval && loadingRedux.approvalALT
                            }
                          >
                            APPROVE {selectedRewardToken?.tokenB?.symbol || ""}
                          </Button>
                        </Grid>
                        <Grid item xs={6} className={classes.btnPaddingLeft}>
                          <Button
                            variant="red"
                            fullWidth
                            onClick={() => onClickSwap(quantity)}
                            disabled={
                              !selectedPortal ||
                              !(quantity > 0) ||
                              parseFloat(balanceALT) < parseFloat(quantity) ||
                              !allowanceALT ||
                              chainId !== 4 ||
                              loadingRedux.swap
                            }
                            loading={loadingRedux.swap}
                          >
                            SWAP
                          </Button>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid item xs={12} className={classes.msgContainer}>
                        <Button
                          variant="red"
                          fullWidth
                          onClick={() => onClickSwap(quantity)}
                          disabled={
                            !selectedPortal ||
                            !(quantity > 0) ||
                            parseFloat(balanceALT) < parseFloat(quantity) ||
                            !allowanceALT ||
                            chainId !== 4 ||
                            loadingRedux.swap
                          }
                          loading={loadingRedux.swap}
                        >
                          SWAP
                        </Button>
                      </Grid>
                    )}
                  </Box>
                  <Box className={classes.btn}>
                    {!(active && account) ? (
                      <Grid
                        item
                        xs={12}
                        className={`${classes.msgContainer} ${classes.cursorPointer}`}
                        onClick={showWalletHint}
                      >
                        <Typography
                          variant="overline"
                          className={classes.redText}
                        >
                          CONNECT YOUR WALLET SWAP TOKENS
                        </Typography>
                      </Grid>
                    ) : chainId !== 4 ? (
                      <Grid item xs={12} className={classes.msgContainer}>
                        <Typography
                          variant="overline"
                          className={classes.redText}
                        >
                          CHANGE NETWORK TO RINKEBY TO SWAP TOKENS
                        </Typography>
                      </Grid>
                    ) : !allowanceALT ? (
                      <Grid item xs={12} className={classes.msgContainer}>
                        <Typography
                          variant="overline"
                          className={classes.redText}
                        >
                          BEFORE YOU CAN SWAP, YOU MUST APPROVE{" "}
                          {selectedRewardToken?.tokenB?.symbol || ""}
                        </Typography>
                      </Grid>
                    ) : null}
                  </Box>
                </Grid>

                <Dialog
                  open={showStakeDialog}
                  // open={true}
                  steps={["APPROVE XIO", "SWAP"]}
                  title="SWAP"
                  onClose={() => setShowStakeDialog(false)}
                  status={[
                    "pending",
                    "success",
                    "failed",
                    "rejected",
                  ].find((item) => dialogStep2.includes(item))}
                  step={dialogStep2}
                  stepperShown={
                    dialogStep2 === "pendingApproval" ||
                    dialogStep2 === "swapProposal"
                  }

                  // status="success"
                >
                  {
                    {
                      pendingApproval: (
                        <Fragment>
                          <Typography
                            variant="body2"
                            className={classes.textBold}
                          >
                            APPROVAL PENDING
                            <br />
                          </Typography>
                        </Fragment>
                      ),
                      //successApproval: (
                      //  <Fragment>
                      //    <Typography
                      //      variant="body1"
                      //      className={classes.textBold}
                      //    >
                      //      APPROVAL
                      //      <br />
                      //      <span className={classes.greenText}>
                      //        SUCCESSFUL
                      //      </span>
                      //    </Typography>
                      //    <Button
                      //      variant="red"
                      //      fullWidth
                      //      onClick={onClickClose}
                      //    >
                      //      CLOSE
                      //    </Button>
                      //  </Fragment>
                      //),
                      swapProposal: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            SWAP
                          </Typography>
                          <Typography
                            variant="body2"
                            className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                          >
                            IF YOU SWAP{" "}
                            <Tooltip
                              title={`${quantity} ${
                                selectedRewardToken?.tokenB?.symbol || ""
                              }`}
                            >
                              <span className={classes.infoTextSpan}>
                                {trunc(quantity)}{" "}
                                {selectedRewardToken?.tokenB?.symbol || ""}
                              </span>
                            </Tooltip>{" "}
                            YOU WILL{" "}
                            <span className={classes.infoTextSpan}>
                              IMMEDIATELY
                            </span>{" "}
                            EARN{" "}
                            {loadingRedux.reward ? (
                              <CircularProgress
                                size={12}
                                className={classes.loaderStyle}
                              />
                            ) : (
                              <Tooltip title={`${swapOutput} XIO`}>
                                <span className={classes.infoTextSpan}>
                                  {" "}
                                  {trunc(swapOutput)} XIO
                                </span>
                              </Tooltip>
                            )}
                          </Typography>

                          <Button
                            variant="red"
                            fullWidth
                            onClick={
                              !allowanceALT
                                ? () => {}
                                : () => onClickSwap(quantity)
                            }
                            disabled={
                              !selectedPortal ||
                              !(quantity > 0) ||
                              parseFloat(balanceALT) < parseFloat(quantity) ||
                              !allowanceALT ||
                              chainId !== 4 ||
                              loadingRedux.swap
                            }
                            loading={loadingRedux.swap}
                          >
                            SWAP
                          </Button>
                        </Fragment>
                      ),
                      failedApproval: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
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
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            APPROVAL
                            <br />
                            <span className={classes.redText}>REJECTED</span>
                          </Typography>
                          <Button variant="red" fullWidth onClick={closeDialog}>
                            DISMISS
                          </Button>
                        </Fragment>
                      ),
                      pendingSwap: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            SWAP PENDING
                            <br />
                          </Typography>
                          <Typography
                            variant="body2"
                            className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                          >
                            SWAPPING {trunc(swapHist?.amount)}{" "}
                            {selectedRewardToken?.tokenB?.symbol || ""} FOR{" "}
                            {trunc(swapOutput)} XIO{" "}
                            {/* <Tooltip
                              title={`${stakeRequest.reward} ${stakeRequest.token}`}
                            >
                              <span>
                                {trunc(stakeRequest.reward)}{" "}
                                {stakeRequest.token}
                              </span>
                            </Tooltip>{" "} */}
                            INSTANTLY
                          </Typography>
                        </Fragment>
                      ),
                      failedSwap: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            SWAP
                            <br />
                            <span className={classes.redText}>FAILED</span>
                          </Typography>
                          <Button variant="red" fullWidth onClick={closeDialog}>
                            DISMISS
                          </Button>
                        </Fragment>
                      ),
                      rejectedSwap: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            SWAP
                            <br />
                            <span className={classes.redText}>REJECTED</span>
                          </Typography>
                          <Button variant="red" fullWidth onClick={closeDialog}>
                            DISMISS
                          </Button>
                        </Fragment>
                      ),
                      successSwap: (
                        <Fragment>
                          <Typography
                            variant="body1"
                            className={classes.textBold}
                          >
                            SWAP
                            <br />
                            <span className={classes.greenText}>
                              SUCCESSFUL
                            </span>
                          </Typography>
                          <Typography
                            variant="body2"
                            className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                          >
                            YOU HAVE SUCCESSFULLY SWAPPED {swapHist?.amount}{" "}
                            {swapHist?.token || ""} FOR {trunc(swapOutput)} XIO
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
                              <Link
                                fontSize="small"
                                className={classes.linkIcon}
                              />
                              VIEW ON ETHERSCAN
                            </a>
                          </Typography>
                          <Button
                            variant="red"
                            fullWidth
                            onClick={onClickClose}
                          >
                            CLOSE
                          </Button>
                        </Fragment>
                      ),
                    }[dialogStep2]
                  }
                </Dialog>
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
                SWAP DASHBOARD
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.accordion}>
              <SwapTable />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding, animation },
  web3: { active, account, chainId },
  user: { currentStaked, pools },
  flashstake: { swapHist },
  contract,
}) => ({
  ...flashstake,
  loading,
  active,
  account,
  animation,
  expanding,
  chainId,
  currentStaked,
  swapHist,
  pools,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalALT,
  calculateReward,
  checkAllowanceALT,
  getBalanceALT,
  setLoading,
  setDialogStep,
  setReset,
  setInitialValues,
  showWalletBackdrop,
  swapALT,
  calculateSwap,
  setExpandAccodion,
  setRefetch,
})(Swap);
