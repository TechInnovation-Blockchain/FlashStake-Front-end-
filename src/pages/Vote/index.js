//#region imports and styling

import React, {
  useEffect,
  useState,
  Fragment,
  useCallback,
  useRef,
} from "react";
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
  Tooltip,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
} from "@material-ui/core";
// import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import MaxBtn from "../../component/MaxBtn";
import { updateAllBalances } from "../../redux/actions/userActions";
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
  getApprovalXIO,
  calculateReward,
  checkAllowance,
  getBalanceXIO,
  stakeXIO,
  setDialogStep,
  // setReset,
  setInitialValues,
  unstakeXIO,
  unstakeEarly,
  createPool,
  setCreateDialogStep,
} from "../../redux/actions/flashstakeActions";
// import { unstakeEarly } from "../../utils/contractFunctions/flashProtocolContractFunctions";
import { setExpandAccodion } from "../../redux/actions/uiActions";
import { debounce } from "../../utils/debounceFunc";
import { trunc } from "../../utils/utilFunc";
import {
  setLoading,
  showWalletBackdrop,
  setHeightValue,
} from "../../redux/actions/uiActions";
import { Link, CheckCircleOutline } from "@material-ui/icons";
// import maxbtn from "../../assets/maxbtn.svg";
import {
  setRefetch,
  selectStake,
  setRefetchProtocols,
} from "../../redux/actions/dashboardActions";
import { useHistory } from "react-router-dom";
import AnimateHeight from "react-animate-height";
import { store } from "../../config/reduxStore";
import AddTokenDialogue from "../../component/AddTokenDialogue";
import DropdownDialog2 from "../../component/DropdownDialog2";
import FlashDropDown from "../../component/FlashDropDown";
import CreateTable from "../../component/CreateTable";
import { CONSTANTS } from "../../utils/constants";

import { SlideDown } from "react-slidedown";

let useStyles = makeStyles((theme) => ({
  contentContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-evenly",
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    // fontSize: 10,
    margin: theme.spacing(1, 0),
    // [theme.breakpoints.down("xs")]: {
    //   fontSize: 8,
    // },
  },
  secondaryText1: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 500,
  },
  redText: {
    // fontSize: 10,
    fontWeight: 500,
    color: theme.palette.xioRed.main,
  },
  infoText: {
    // fontSize: 10,
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  infoTextSpan: {
    // fontSize: 10,
    fontWeight: 500,
    color: theme.palette.xioRed.main,
    position: "relative",
  },
  secondaryTextWOMargin: {
    color: theme.palette.text.secondary2,
    fontWeight: 500,
  },
  textBold: {
    fontWeight: 500,
  },
  xIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
    marginTop: 30,
    // fontSize: 15,
    alignSelf: "center",
    margin: theme.spacing(0, 2),
    marginLeft: 22,
    // marginLeft: 2,
  },
  checkbox: {
    padding: 0,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  comingSoon: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
    margin: theme.spacing(4, 0),
  },
  textField: {
    background: theme.palette.background.secondary2,
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    boxSizing: "border-box",
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "500 !important",
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
    height: 35,
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
    fontWeight: 500,
    // fontSize: 11,
    cursor: "pointer",
  },
  dropDown: {
    "&.makeStyles-dropdown": {
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
      color: theme.palette.xioRed.main,
    },
  },
  accordion: {
    backgroundColor: theme.palette.background.secondary,
  },
  stakeDashBtn: {
    color: "inherit",
    fontWeight: 500,
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
  loaderStyle: {
    marginBottom: -2,
    // position: "absolute",
    // left: 2,
    // top: "10%",
  },
  dialogIcon: {
    fontSize: 80,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 500,
  },
  gridSpace: {
    margin: theme.spacing(1, 0),
  },
  gridSpace2: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  select: {
    visibility: "hidden",
    position: "absolute",
  },
  ".MuiSelect-select.MuiSelect-select": {
    display: "none",
  },
  item: {
    "&.MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover": {
      color: `${theme.palette.text.secondary} !importtant`,
    },
    "&:hover": {
      backgroundColor: `${theme.palette.background.secondary3} !important`,
    },
  },
  timeText: {
    fontWeight: 500,
    color: "#9191A7",
    "&:hover": {
      // background: theme.palette.background.primary,
      color: theme.palette.xioRed.main,

      // "& svg": {
      //   fill: theme.palette.xioRed.main,
      // },
    },
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

//#endregion

function Vote({
  getFlashstakeProps,
  stakeTokens,
  rewardTokens,
  selectedStakeToken,
  selectedRewardToken,
  setSelectedStakeToken,
  setSelectedRewardToken,
  selectedPortal,
  allowanceXIO,
  getApprovalXIO,
  calculateReward,
  reward,
  loading: loadingRedux,
  active,
  account,
  checkAllowance,
  allowanceXIOProtocol,
  getBalanceXIO,
  balanceXIO,
  stakeXIO,
  unstakeXIO,
  unstakeEarly,
  setLoading,
  dialogStep,
  clearField,
  setDialogStep,
  stakeRequest,
  unstakeRequest,
  reset,
  dappBalance,
  expiredDappBalance,
  // setReset,
  chainId,
  stakeTxnHash,
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
  animation,
  updateAllBalances,
  heightVal,
  setHeightValue,
  totalBurnAmount,
  totalBalanceWithBurn,
  selectedStakes,
  selectStake,
  stakes,
  totalBurn,
  changeApp,
  maxDays,
  createPool,
  setCreateDialogStep,
  dialogStep4,
  createPoolData,
  withdrawLiquidityTxnHash,
  setRefetchProtocols,
  ...props
}) {
  let classes = useStyles();
  const web3context = useWeb3React();
  const history = useHistory();
  const [height, setHeight] = useState(heightVal);
  const [heightToggle, setHeightToggle] = useState(false);
  const ref = useRef(null);
  const [time, setTime] = useState("Hrs");
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState({});
  const [loadingcreate, setLoadingcreate] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setCreateDialogStep("pendingLiquidity");
    setOpen(true);
  };
  // useEffect(() => {
  //   setTimeout(() => {
  //     // setHeightToggle(!heightToggle);
  //     setHeightValue(ref?.current?.clientHeight);
  //   }, 100);
  // });

  const handleCreatePool = async (token) => {
    // setLoadingcreate(true);
    setCreateDialogStep("pendingCreatePool");
    setShowStakeDialog(true);
    createPool(token);
    // setLoadingcreate(false);
  };

  const toggle = () => {
    setHeight(height > 300 ? heightVal : "100%");
  };

  useEffect(() => {
    if (history.location.pathname === "/stake") {
      toggle();
    }
  }, [history.location.pathname]);

  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [expanded2, setExpanded2] = useState(true);

  const debouncedCalculateReward = useCallback(
    debounce(calculateReward, 500),
    []
  );

  const [days, setDays] = useState(initialValues.days);
  const [quantity, setQuantity] = useState(initialValues.quantity);
  const regex = /^\d*(.(\d{1,18})?)?$/;

  const onChangeDays = ({ target: { value } }) => {
    if (/^[0-9]*$/.test(value)) {
      setDays(value);
    }
  };
  const onChangeQuantity = ({ target: { value } }) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(value)) {
      setQuantity(value);
    }
  };

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  useEffect(() => {
    // document.title = "Create - FLASH | THE TIME TRAVEL OF MONEY";
    // setLoading({ dapp: true });
    setRefetch(true);
  }, [setRefetch]);

  useEffect(() => {
    setInitialValues(quantity, days);
  }, [days, quantity, setInitialValues]);

  useEffect(() => {
    if (reset) {
      // getBalanceXIO();
      updateAllBalances();
      // setReset(false);
    }
  }, [reset, getBalanceXIO]);

  useEffect(() => {
    if (selectedPortal) {
      debouncedCalculateReward(quantity, days, time);
      const _rewardRefreshInterval = setInterval(() => {
        debouncedCalculateReward(quantity, days, time);
      }, 60000);
      return () => {
        clearInterval(_rewardRefreshInterval);
      };
    }
  }, [
    setLoading,
    selectedPortal,
    days,
    quantity,
    debouncedCalculateReward,
    time,
  ]);

  useEffect(() => {
    if (active && account) {
      showWalletBackdrop(false);
    }
  }, [active, account]);

  const onClickClose = () => {
    // setReset(true);
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

  // useEffect(() => {
  //   if (token) {
  //   }
  // }, [token]);
  // props.history.location.pathname === "/swap" ? true :
  const [isDisabled, setIsDisabled] = useState(false);
  const setDisable = () => {
    if (
      !allowanceXIOProtocol ||
      !active ||
      !account ||
      !selectedPortal ||
      quantity <= 0 ||
      days <= 0 ||
      loadingRedux.reward ||
      loadingRedux.stake ||
      chainId !== CONSTANTS.CHAIN_ID ||
      reward <= 0 ||
      (active && account && parseFloat(quantity) > parseFloat(walletBalance))
    ) {
      setIsDisabled(true);
    }
  };

  return (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
        {/* <SlideDown className={"my-dropdown-slidedown"}> */}
        <Box
          ref={ref}
          className={`${classes.contentContainer} contentContainer1`}
        >
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
              <Grid container>
                <Grid item xs={12}>
                  {/* <TextField
                      className={classes.textField}
                      fullWidth
                      placeholder="FLASH"
                      value={"FLASH"}
                      disabled={true}
                    /> */}
                  <FlashDropDown />
                </Grid>

                <Grid item className={classes.gridSpace} xs={12}>
                  <Typography variant="body1" className={classes.secondaryText}>
                    What token do you want to pair with
                  </Typography>
                  <DropdownDialog2
                    className={classes.dropDown}
                    items={pools}
                    setToken={setToken}
                    heading="SELECT TOKEN"
                  />
                </Grid>

                <Grid item className={classes.gridSpace} xs={12}></Grid>

                <Grid
                  item
                  className={classes.gridSpace}
                  xs={12}
                  onClick={showWalletHint}
                >
                  <Button
                    fullWidth
                    variant="retro"
                    disabled={!token?.decimals || loadingRedux.createPool}
                    loading={loadingRedux.createPool}
                    onClick={() => handleCreatePool(token)}
                  >
                    CREATE
                  </Button>
                </Grid>

                {!(active && account) ? (
                  <Grid
                    item
                    xs={12}
                    onClick={showWalletHint}
                    className={classes.cursorPointer}
                  >
                    <Typography
                      // variant="overline"
                      variant="body2"
                      className={`${classes.redText} ${classes.gridSpace2}`}
                    >
                      Connect wallet to create pools
                    </Typography>
                  </Grid>
                ) : chainId !== CONSTANTS.CHAIN_ID ||
                  web3context.error instanceof
                    UnsupportedChainIdError ? null : null}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
        {/* </SlideDown> */}

        <Dialog
          open={showStakeDialog}
          // open={true}
          steps={["CREATE"]}
          title="CREATE"
          onClose={() => setShowStakeDialog(false)}
          status={["pending", "success", "failed", "rejected"].find((item) =>
            dialogStep4.includes(item)
          )}
          step={dialogStep4}
          // stepperShown={"pendingCreatePool"}
        >
          {
            {
              pendingCreatePool: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    CREATE POOL PENDING
                    <br />
                  </Typography>
                  <Typography variant="body1" className={classes.textBold}>
                    Creating FLASH/{createPoolData?._token?.symbol} pool
                  </Typography>
                </Fragment>
              ),
              failedCreatePool: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    CREATE POOL FAILED
                    <br />
                    <span className={classes.redText}>FAILED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              rejectedCreatePool: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    CREATE POOL REJECTED
                    <br />
                    <span className={classes.redText}>REJECTED</span>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={closeDialog}>
                    DISMISS
                  </Button>
                </Fragment>
              ),
              successCreatePool: (
                <Fragment>
                  <Typography variant="body1" className={classes.textBold}>
                    CREATE POOL
                    <br />
                    <span className={classes.greenText}>SUCCESSFUL</span>
                  </Typography>
                  <Typography
                    variant="body1"
                    className={`${classes.textBold} ${classes.secondaryTextWOMargin}`}
                  >
                    FLASH/{createPoolData?._token?.symbol} pool created
                    successfully
                  </Typography>
                  <Typography
                    variant="body2"
                    className={`${classes.textBold} ${classes.redText}`}
                  >
                    <a
                      href={`https://ropsten.etherscan.io/tx/${withdrawLiquidityTxnHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={classes.link}
                    >
                      <Link fontSize="small" className={classes.linkIcon} />
                      View on etherscan
                    </a>
                  </Typography>
                  <Button variant="retro" fullWidth onClick={onClickClose}>
                    CLOSE
                  </Button>
                </Fragment>
              ),
            }[dialogStep4]
          }
        </Dialog>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = ({
  flashstake,
  ui: { loading, expanding, animation, heightVal, changeApp, clearField },
  web3: { active, account, chainId },
  dashboard: { selectedStakes, isStakesSelected, totalBurn },
  user: {
    currentStaked,
    stakes,
    pools,
    walletBalance,
    dappBalance,
    expiredDappBalance,
    totalBurnAmount,
    totalBalanceWithBurn,
    expired,
  },
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
  dappBalance,
  expiredDappBalance,
  heightVal,
  totalBurnAmount,
  totalBalanceWithBurn,
  selectedStakes,
  stakes,
  totalBurn,
  clearField,
  changeApp,
  ...contract,
});

export default connect(mapStateToProps, {
  setSelectedStakeToken,
  setSelectedRewardToken,
  getApprovalXIO,
  calculateReward,
  checkAllowance,
  getBalanceXIO,
  stakeXIO,
  setLoading,
  setDialogStep,
  // setReset,
  setInitialValues,
  setRefetch,
  showWalletBackdrop,
  setExpandAccodion,
  updateAllBalances,
  setHeightValue,
  unstakeEarly,
  unstakeXIO,
  selectStake,
  createPool,
  setCreateDialogStep,
  setRefetchProtocols,
})(Vote);
