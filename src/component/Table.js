import React, {
  useState,
  useCallback,
  Fragment,
  useEffect,
  useRef,
} from "react";
import {
  Button as MuiButton,
  Grid,
  Tooltip,
  Typography,
  CircularProgress,
  TablePagination,
  Box,
  Checkbox,
} from "@material-ui/core";

import FormControlLabel from "@material-ui/core/FormControlLabel";
import { connect } from "react-redux";
import { makeStyles, withStyles } from "@material-ui/styles";
import { UnfoldMore } from "@material-ui/icons";

import { showWalletBackdrop, setHeightValue } from "../redux/actions/uiActions";
import { trunc, getPercentageAmount } from "../utils/utilFunc";
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import { unstakeXIO } from "../redux/actions/flashstakeActions";
import {
  selectStake,
  setStakeStatus,
  clearSelection,
} from "../redux/actions/dashboardActions";
import { store } from "../config/reduxStore";
import { useHistory } from "react-router-dom";
import { CONSTANTS } from "../utils/constants";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Zoom from "@material-ui/core/Zoom";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles((theme) => ({
  gridHead: {
    borderBottom: `1px solid ${theme.palette.border.gray}`,
  },
  // root: {
  //   color: theme.palette.xioRed.main,
  //   "&$checked": {
  //     color: theme.palette.xioRed.main,
  //   },
  // },
  // checked: {},
  gridItem: {
    ...theme.typography.body2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 500,

    margin: theme.spacing(1, 0),
  },
  gridItemProgress: {
    ...theme.typography.body2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 500,

    margin: theme.spacing(0.5, 0, 1, 0),
  },
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  redText: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
    // fontSize: 10,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
  },
  fontWeight: {
    fontWeight: 700,
  },
  tableHeadItemBtn: {
    fontWeight: 500,
    // fontSize: 10,
    color: theme.palette.text.secondary,
    display: "flex",
  },
  msgContainer: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    padding: theme.spacing(2, 0),
  },
  msg: {
    marginBottom: theme.spacing(1),
    fontWeight: 500,
  },
  cursorPointer: {
    cursor: "pointer",
  },
  selected: {
    background: `${theme.palette.background.selected} !important`,
  },
  checkbox: {
    padding: 0,
    position: "absolute",
    right: 10,
    top: 35,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  gridSp: {
    display: "flex",
    // justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(0, 1),
  },
  radioBtn: {
    padding: 0,
    position: "absolute",
    right: 10,
    top: 35,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  mainHead: {
    // fontSize: 9,
    fontWeight: 600,
    color: theme.palette.text.grey,
    margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  secHead: {
    // fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text.primary,
    // margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  sortButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  walletInfo: {
    // marginBottom: theme.spacing(2),
  },
  link: {
    textDecoration: "none",
    display: "contents",

    "&link": {
      textDecoration: "none",
    },
  },
  marginBottomMsg: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  disabledText: {
    fontWeight: 500,
    color: theme.palette.text.disabled,
    textAlign: "center",
  },
  progressBox: {
    background: theme.palette.background.historyTableBox,
    padding: theme.spacing(1, 0),
    height: "100% !important",
    margin: theme.spacing(1, 0),
    position: "relative",
    // paddingRight: 26,
    // borderRadius: 5,
  },

  progressBar: {
    // root: {
    width: "90% !important",
    height: "10px !important",
    position: "relative",
    // paddingBottom: 10,

    // },
  },
  progressBarColor: {
    "& .MuiLinearProgress-barColorPrimary": {
      color: `${theme.palette.xioRed.main} !important`,
    },
  },
  startPoint: {
    position: "absolute",
    left: 0,
    top: 15,
    fontWeight: 600,
  },
  endPoint: {
    position: "absolute",
    right: 0,
    top: 15,
    fontWeight: 600,
  },
  MidPoint: {
    // position: "absolute",
    // right: "43%",
    // top: 15,
    fontWeight: 700,
    // paddingLeft: theme.spacing(1),
  },
  tooltip: {
    background: `${theme.palette.background.primary} !important`,
    // color:
  },
  stakeStatus: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    // padding: theme.spacing(0, 4),
  },
  linkText: {
    cursor: "pointer",
    color: theme.palette.xioRed.main,
    fontWeight: 600,
  },
}));

const StyledLinearProgress = withStyles((theme) => ({
  colorPrimary: {
    backgroundColor: theme.palette.xioRed.dark,
  },
  barColorPrimary: {
    backgroundColor: theme.palette.xioRed.main,
  },
}))(LinearProgress);

function TableComponent({
  stakes,
  openWithdrawDialog,
  loading,
  loadingRedux,
  active,
  account,
  chainId,
  showWalletBackdrop,
  selectedStakes,
  clearSelection,
  isStakesSelected,
  walletBalance,
  dappBalance,
  unstakeXIO,
  expiredDappBalance,
  onClickUnstake,
  onClickUnstake2,
  selectStake,
  changeApp,
  oneDay,
  totalBurn,
  setStakeStatus,
  theme,
  // toggle,
  heightVal,
  setHeightValue,
  heightToggle,
}) {
  const classes = useStyles();
  const headItems = ["OUTPUT", "UNLOCKED", "REMAINING"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [allowSelect, setAllowSelect] = useState();

  const history = useHistory();
  const [height, setHeight] = useState(heightVal);
  const ref = useRef(null);

  function LinearProgressWithLabel({ total, outof, time }) {
    // console.log("VALUES", total, outof);
    return (
      <Box
        display="flex"
        // height="100%"
        // flexDirection="column"
        alignItems="center"
      >
        <Box width="100%">
          <Tooltip
            title={`Staked on ${new Date(time * 1000)
              .toString()
              .substring(4, 15)}`}
            arrow
            TransitionComponent={Zoom}
          >
            <StyledLinearProgress
              className={classes.progressBarColor}
              variant="determinate"
              value={total === outof ? 100 : getPercentageAmount(total, outof)}
            />
          </Tooltip>
        </Box>
        {/* <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">
            {props.value}
          </Typography>
        </Box> */}
      </Box>
    );
  }

  useEffect(() => {
    // setTimeout(() => {
    //   setHeightValue(ref?.current?.clientHeight);
    // }, 100);
  });

  const toggle = () => {
    setHeight(height > 300 ? heightVal : "100%");
  };

  useEffect(() => {
    // if (history.location.pathname === "/stake") {
    toggle();
    // }
  }, []);

  useEffect(() => {
    setPage(0);
  }, [stakes]);

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  const onClickSortBtn = useCallback(
    (_sortBy) => {
      if (sortBy === _sortBy) {
        setSortDirection((val) => !val);
      } else {
        setSortBy(_sortBy);
        setSortDirection(false);
      }
    },
    [sortBy]
  );
  const sortedData = useCallback(() => {
    let data = [];
    switch (sortBy) {
      case "OUTPUT":
        data = stakes?.sort(
          (
            {
              pool: {
                tokenB: { symbol: a },
              },
            },
            {
              pool: {
                tokenB: { symbol: b },
              },
            }
          ) => {
            if (a < b) {
              return -1;
            }
            if (a > b) {
              return 1;
            }
            return 0;
          }
        );

        break;
      case "UNLOCKED":
        data = stakes?.sort(
          ({ amountAvailable: a }, { amountAvailable: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      case "REMAINING":
        data = stakes?.sort(
          (a, b) => parseFloat(a.expiryTime) - parseFloat(b.expiryTime)
        );
        break;
      default:
        data = stakes.sort(
          (a, b) => parseFloat(b.expireAfter) - parseFloat(a.expireAfter)
        );
        // data = stakes.reverse();
        break;
    }
    return sortDirection ? data.reverse() : data;
  }, [stakes, sortBy, sortDirection]);

  const handleChangePage = useCallback(
    (event, newPage) => {
      setReverse(newPage < page);
      setPage(newPage);
      // toggle();
    },
    [page]
  );

  // useEffect(() => {
  //   toggle();
  // }, []);

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  return (
    <Grid ref={ref} container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body2">
            Wallet Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} FLASH`}>
              <span>{trunc(walletBalance)} FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body2">
            Dapp Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${dappBalance} FLASH`}>
              <span>{trunc(dappBalance)} FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="overline">
          <a href={CONSTANTS.STATS_PAGE} target="_blank">
            {" "}
            <b className={classes.linkText}>SEE CHARTS AND STATS</b>
          </a>
        </Typography>
      </Grid>

      <Grid container item xs={12}>
        <Grid container item xs={12} className={classes.gridHead}>
          {headItems.map((headItem) => (
            <Grid item xs={4} className={classes.gridItem} key={headItem}>
              <MuiButton
                className={classes.tableHeadItemBtn}
                onClick={() => onClickSortBtn(headItem)}
              >
                <Box className={classes.sortButton}>
                  <UnfoldMore fontSize="small" className={classes.sortIcon} />
                  {headItem}
                </Box>
              </MuiButton>
            </Grid>
          ))}
        </Grid>
        {!(active && account) ? (
          <Grid
            item
            xs={12}
            className={`${classes.msgContainer} ${classes.cursorPointer}`}
            onClick={showWalletHint}
          >
            <Typography variant="body2" className={classes.redText}>
              Connect wallet to view your stakes
            </Typography>
          </Grid>
        ) : !loading ? (
          stakes?.length ? (
            chainId !== CONSTANTS.CHAIN_ID ? null : (
              <Fragment>
                <PageAnimation in={true} key={page} reverse={reverse}>
                  <Grid container>
                    {sortedData()
                      .slice(page * 4, page * 4 + 4)
                      .map((_stake) => {
                        // const _remDur =
                        //   (_stake.expiryTime - Date.now() / 1000) / 3600;
                        // const _daysRem = _remDur < 1 ? null : Math.ceil(_remDur);
                        // const _minRem = Math.ceil(_remDur * 60);
                        const _remDur = _stake.expiryTime - Date.now() / 1000;
                        const _daysRem = Math.trunc(_remDur / 86400);
                        const _hoursRem = Math.trunc(
                          (_remDur - _daysRem * 86400) / 3600
                        );
                        const _minsRem = Math.ceil(
                          (_remDur - _daysRem * 86400 - _hoursRem * 3600) / 60
                        );
                        return (
                          // <a
                          //   href={`https://ropsten.etherscan.io/tx/${_stake.transactionHash}`}
                          //   className={classes.link}
                          //   target="_blank"
                          // >

                          //   isStakesSelected && totalBurn.totalBurn > 0
                          //       ? clearSelection()
                          //     : selectStake(_stake.id)

                          <Grid
                            container
                            item
                            xs={12}
                            key={_stake.id}
                            onClick={() => selectStake(_stake.id)}
                            className={`${classes.cursorPointer} ${
                              selectedStakes[_stake.id]
                                ? classes.selected
                                : null
                            } ${classes.progressBox}`}
                          >
                            {/* <Box className={classes.progressBox}> */}
                            <Grid
                              item
                              xs={4}
                              style={{ justifyContent: "flexStart" }}
                              className={classes.gridItem}
                            >
                              {/* <Tooltip
                        title={`${_stake.rewardEarned} ${_stake.tokenB}`}
                      > */}
                              <span className={classes.flexCenter}>
                                <img
                                  src={tryRequire(_stake.pool.tokenB.symbol)}
                                  alt="Logo"
                                  srcSet=""
                                  width={20}
                                  style={{ marginRight: 5 }}
                                />
                                <Typography
                                  variant="body2"
                                  className={classes.fontWeight}
                                >
                                  {_stake.pool.tokenB.symbol}
                                </Typography>
                              </span>
                              {/* </Tooltip> */}
                            </Grid>
                            <Grid item xs={4} className={classes.gridItem}>
                              <span className={classes.flexCenter}>
                                <Typography
                                  variant="body1"
                                  className={classes.fontWeight}
                                >
                                  {`${getPercentageAmount(
                                    _stake.stakeAmount,
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  )}%`}
                                </Typography>
                              </span>
                            </Grid>

                            <Grid
                              item
                              xs={4}
                              className={`${classes.gridItem} ${classes.gridSp}`}
                            >
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {" "}
                                {!_stake.expired &&
                                _stake.expiryTime > Date.now() / 1000 ? (
                                  <Fragment>
                                    {_daysRem > 0
                                      ? `${_daysRem} ${
                                          _daysRem > 1 ? "days" : "day"
                                        } ${_hoursRem} ${
                                          _hoursRem > 1 ? "hrs" : "hr"
                                        }`
                                      : _hoursRem > 0
                                      ? `${_hoursRem} ${
                                          _hoursRem > 1 ? "hrs" : "hr"
                                        } ${_minsRem} ${
                                          _minsRem > 1 ? "mins" : "min"
                                        }`
                                      : `${_minsRem} ${
                                          _minsRem > 1 ? "mins" : "min"
                                        }`}
                                  </Fragment>
                                ) : (
                                  "Completed"
                                )}
                              </Typography>

                              {/* {isStakesSelected ? (
                                _stake.burnAmount > 0 ? (
                                  <Radio
                                    checked={
                                      selectedStakes[_stake.id] ? true : false
                                    }
                                    // onChange={handleChange}
                                    color="inherit"
                                    // value=

                                    className={classes.radioBtn}
                                    name="radio-button-demo"
                                    inputProps={{ "aria-label": "A" }}
                                  />
                                ) : (
                                  <Checkbox
                                    size="small"
                                    checked={
                                      selectedStakes[_stake.id] ? true : false
                                    }
                                    // checked={false}
                                    // disabled
                                    // inputProps={{
                                    // //   "aria-label": "disabled checkbox",
                                    // }}
                                    className={classes.checkbox}
                                  />
                                )
                              ) : null} */}
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              className={`${classes.gridItemProgress} `}
                            >
                              <Box className={classes.progressBar}>
                                <LinearProgressWithLabel
                                  // style={{ paddingTop: 5 }}
                                  total={_stake.stakeAmount}
                                  outof={
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  }
                                  time={_stake.timestamp}
                                />
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Box className={classes.stakeStatus}>
                                <Tooltip
                                  title={`${
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  }/${_stake.stakeAmount} FLASH`}
                                >
                                  <Typography
                                    variant="body2"
                                    className={classes.MidPoint}
                                  >
                                    {/* {`${getPercentageAmount(
                                    trunc(_stake.stakeAmount),
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  )}%`} */}
                                    {trunc(
                                      _stake.amountAvailable > 0
                                        ? _stake.amountAvailable
                                        : _stake.stakeAmount - _stake.burnAmount
                                    )}
                                    /{trunc(_stake.stakeAmount)}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Grid>

                            {/* <Grid
                              item
                              xs={12}
                              className={`${classes.gridItemProgress} `}
                            >
                              <div className={classes.progressBar}>
                                <Typography
                                  variant="caption"
                                  className={classes.startPoint}
                                >
                                  Locked
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className={classes.endPoint}
                                >
                                  Unlocked
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className={classes.MidPoint}
                                >
                                  {`${getPercentageAmount(
                                    trunc(_stake.stakeAmount),
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  )}%`}
                                </Typography>

                                <LinearProgressWithLabel
                                  // style={{ paddingTop: 5 }}
                                  total={trunc(_stake.stakeAmount)}
                                  outof={trunc(
                                    _stake.amountAvailable > 0
                                      ? _stake.amountAvailable
                                      : _stake.stakeAmount - _stake.burnAmount
                                  )}
                                  time={_stake.timestamp}
                                />
                              </div>
                            </Grid> */}
                          </Grid>
                        );
                      })}
                  </Grid>
                </PageAnimation>
                {sortedData().length > 4 ? (
                  <Grid item xs={12} className={classes.gridItem}>
                    <TablePagination
                      rowsPerPageOptions={[]}
                      component="div"
                      count={sortedData().length}
                      rowsPerPage={4}
                      page={page}
                      onChangePage={handleChangePage}
                      labelRowsPerPage=""
                      // onChangeRowsPerPage={toggle()}
                      nextIconButtonProps={{ color: "primary" }}
                    />
                  </Grid>
                ) : null}
                {sortedData().length && dappBalance > 0 ? (
                  <Fragment>
                    <Grid item xs={12} className={classes.marginBottomMsg}>
                      <Typography
                        variant="body2"
                        className={classes.disabledText}
                        // onClick={toggleTable}
                      >
                        {/* SELECT STAKES TO WITHDRAW SPECIFIC ONES */}
                        Select stakes to withdraw specific ones
                      </Typography>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem2}>
                      <Button
                        variant={!changeApp ? "retro" : "red"}
                        fullWidth
                        onClick={
                          isStakesSelected ? onClickUnstake2 : onClickUnstake
                        }
                        disabled={
                          (!isStakesSelected && !(expiredDappBalance > 0)) ||
                          //   : !isStakesSelected
                          loadingRedux.unstake
                          // loadingRedux.unstake || !(dappBalance > 0)
                        }
                        fontSizeLocal="body2"
                        loading={loadingRedux.unstake}
                      >
                        <span>
                          {isStakesSelected ? "UNSTAKE SELECTED" : "UNSTAKE"}
                        </span>
                      </Button>
                    </Grid>
                  </Fragment>
                ) : null}
              </Fragment>
            )
          ) : (
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="body2" className={classes.msg}>
                No available stakes
              </Typography>
            </Grid>
          )
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <CircularProgress size={12} />
            <Typography variant="body2">LOADING</Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  user: { stakes, walletBalance, dappBalance, expiredDappBalance },
  dashboard: { selectedStakes, isStakesSelected, totalBurn },
  ui: { loading, changeApp, theme, heightVal },
  contract: { oneDay },
}) => ({
  stakes,
  active,
  account,
  chainId,
  selectedStakes,
  isStakesSelected,
  walletBalance,
  dappBalance,
  loading: loading.data,
  loadingRedux: loading,
  expiredDappBalance,
  changeApp,
  oneDay,
  totalBurn,
  theme,
  heightVal,
});

export default connect(mapStateToProps, {
  showWalletBackdrop,
  unstakeXIO,
  selectStake,
  clearSelection,
  setStakeStatus,
  clearSelection,
  setHeightValue,
})(TableComponent);
