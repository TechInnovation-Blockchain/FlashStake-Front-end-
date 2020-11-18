import React, { useState, useCallback, Fragment, useEffect } from "react";
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
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import { UnfoldMore } from "@material-ui/icons";

import { showWalletBackdrop } from "../redux/actions/uiActions";
import { trunc } from "../utils/utilFunc";
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import { unstakeXIO } from "../redux/actions/flashstakeActions";
import {
  selectStake,
  setStakeStatus,
  clearSelection,
} from "../redux/actions/dashboardActions";
import { store } from "../config/reduxStore";

const useStyles = makeStyles((theme) => ({
  gridHead: {
    borderBottom: `1px solid ${theme.palette.border.gray}`,
  },
  gridItem: {
    ...theme.typography.body2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700,

    margin: theme.spacing(1, 0),
  },
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  redText: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
    // fontSize: 10,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
  },
  tableHeadItemBtn: {
    fontWeight: 700,
    // fontSize: 10,
    color: theme.palette.text.secondary,
    display: "flex",
  },
  msgContainer: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    padding: theme.spacing(2, 0),
  },
  msg: {
    marginBottom: theme.spacing(1),
    fontWeight: 700,
  },
  cursorPointer: {
    cursor: "pointer",
  },
  selected: {
    background: theme.palette.background.selected,
  },
  checkbox: {
    padding: 0,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  mainHead: {
    // fontSize: 9,
    fontWeight: 700,
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
    fontWeight: 700,
    color: theme.palette.text.disabled,
    textAlign: "center",
  },
}));

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
}) {
  const classes = useStyles();
  const headItems = ["OUTPUT", "UNLOCKED", "REMAINING"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [allowSelect, setAllowSelect] = useState();

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
    },
    [page]
  );

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  return (
    <Grid container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body2">
            Wallet Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} $FLASH`}>
              <span>{trunc(walletBalance)} $FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body2">
            Dapp Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${dappBalance} $FLASH`}>
              <span>{trunc(dappBalance)} $FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>
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
              Connect your wallet to view you stakes
            </Typography>
          </Grid>
        ) : chainId !== 4 ? (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="body2" className={classes.redText}>
              {/* CHANGE NETWORK TO RINKEBY TO UNSTAKE TOKENS */}
              Change network to rinkeby to unstake tokens
            </Typography>
          </Grid>
        ) : !loading ? (
          stakes?.length ? (
            <Fragment>
              <PageAnimation in={true} key={page} reverse={reverse}>
                <Grid container>
                  {sortedData()
                    .slice(page * 5, page * 5 + 5)
                    .map((_stake) => {
                      const _remDur =
                        (_stake.expiryTime - Date.now() / 1000) / 3600;
                      const _daysRem = _remDur < 1 ? null : Math.ceil(_remDur);
                      const _minRem = Math.ceil(_remDur * 60);
                      return (
                        // <a
                        //   href={`https://rinkeby.etherscan.io/tx/${_stake.transactionHash}`}
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
                          // ////////////////////////////// LOGIC ERROR HERE
                          onClick={() => selectStake(_stake.id)}
                          className={`${classes.cursorPointer} ${
                            selectedStakes[_stake.id] ? classes.selected : null
                          }`}
                        >
                          {/* {console.log("Stake -- > ", _stake)} */}
                          <Grid item xs={4} className={classes.gridItem}>
                            {/* <Tooltip
                        title={`${_stake.rewardEarned} ${_stake.tokenB}`}
                      > */}
                            <span className={classes.flexCenter}>
                              <img
                                src={tryRequire(_stake.pool.tokenB.symbol)}
                                alt="Logo"
                                srcSet=""
                                width={15}
                                style={{ marginRight: 5 }}
                              />
                              {_stake.pool.tokenB.symbol}
                            </span>
                            {/* </Tooltip> */}
                          </Grid>
                          <Grid item xs={4} className={classes.gridItem}>
                            <Tooltip
                              title={`${
                                _stake.amountAvailable > 0
                                  ? _stake.amountAvailable
                                  : _stake.stakeAmount - _stake.burnAmount
                              }/${_stake.stakeAmount} $FLASH`}
                            >
                              <span className={classes.flexCenter}>
                                <img
                                  src={tryRequire("$FLASH")}
                                  alt="Logo"
                                  srcSet=""
                                  width={15}
                                  style={{ marginRight: 5 }}
                                />
                                {trunc(
                                  _stake.amountAvailable > 0
                                    ? _stake.amountAvailable
                                    : _stake.stakeAmount - _stake.burnAmount
                                )}
                                /{trunc(_stake.stakeAmount)} $FLASH
                              </span>
                            </Tooltip>
                          </Grid>

                          <Grid item xs={4} className={classes.gridItem}>
                            {!_stake.expired &&
                            _stake.expiryTime > Date.now() / 1000 ? (
                              <Fragment>
                                {_daysRem || _minRem}{" "}
                                {_daysRem
                                  ? _daysRem === 1
                                    ? "hour"
                                    : "hours"
                                  : _minRem === 1
                                  ? "min"
                                  : "mins"}
                              </Fragment>
                            ) : (
                              "Completed"
                            )}
                            {isStakesSelected ? (
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
                            ) : null}
                          </Grid>
                        </Grid>
                      );
                    })}
                </Grid>

                {/* {totalBurn.totalBurn > 0 &&
                  isStakesSelected &&
                  allowSelect > 0 && (
                    <Grid item xs={12} className={classes.marginBottomMsg1}>
                      <Typography
                        variant="overline"
                        className={classes.redText}
                        // onClick={toggleTable}
                      >
                        EXPIRED AND UNEXPIRED CANNOT BE UNSTAKED AT ONCE
                      </Typography>
                    </Grid>
                  )} */}
              </PageAnimation>
              {sortedData().length > 5 ? (
                <Grid item xs={12} className={classes.gridItem}>
                  <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={sortedData().length}
                    rowsPerPage={5}
                    page={page}
                    onChangePage={handleChangePage}
                    labelRowsPerPage=""
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
                        !isStakesSelected && !(expiredDappBalance > 0)
                        //   : !isStakesSelected
                        // loadingRedux.unstake || !(dappBalance > 0)
                      }
                      fontSizeLocal="body2"
                      loading={loadingRedux.unstake}
                    >
                      <Tooltip title={`${expiredDappBalance} $FLASH`}>
                        <span>
                          {isStakesSelected ? "UNSTAKE SELECTED" : "UNSTAKE"}
                        </span>
                      </Tooltip>
                    </Button>
                  </Grid>
                </Fragment>
              ) : null}
            </Fragment>
          ) : (
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="body2" className={classes.msg}>
                No available stakes
              </Typography>
            </Grid>
          )
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="body2">
              <CircularProgress size={12} /> LOADING
            </Typography>
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
  ui: { loading, changeApp },
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
});

export default connect(mapStateToProps, {
  showWalletBackdrop,
  unstakeXIO,
  selectStake,
  clearSelection,
  setStakeStatus,
  clearSelection,
})(TableComponent);
