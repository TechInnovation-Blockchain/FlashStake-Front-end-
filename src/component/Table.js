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
import { Link } from "react-router-dom";
import {
  selectStake,
  calculateBurn,
  calculateBurnStakes,
  withdrawSpecificStakes,
  clearSelection,
} from "../redux/actions/dashboardActions";
import { JSBI } from "@uniswap/sdk";
import Web3 from "web3";

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
}) {
  const classes = useStyles();
  const headItems = ["OUTPUT", "UNLOCKED", "REMAINING"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [earlyWith, setEarlyWith] = useState(false);
  const [expiredStakes, setExpiredStakes] = useState({});

  // useEffect(() => {}, []);

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
          (a, b) =>
            parseFloat(b.initiationTimestamp) -
            parseFloat(a.initiationTimestamp)
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

  const toggleTable = () => {
    setEarlyWith(!earlyWith);
    clearSelection();
  };

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  // const withdrawSelected = useCallback(() => {
  //   const _selectedStakes = stakes.filter((stake) => selectedStakes[stake.id]);
  //   let amount = JSBI.BigInt(0);
  //   _selectedStakes.map((_stake) => {
  //     amount = JSBI.add(amount, JSBI.BigInt(_stake.stakeAmount));
  //     return null;
  //   });
  //   amount = Web3.utils.fromWei(amount.toString());
  //   if (
  //     _selectedStakes.find(
  //       (_stake) =>
  //         !_stake.expired && _stake.expiry > parseFloat(Date.now() / 1000)
  //     )
  //   ) {
  //     let burn = calculateBurnStakes(_selectedStakes);
  //     onClickUnstake2();
  //   } else {
  //     // setDialogStep("confirmSelectedWithdraw");
  //   }
  //   // setShowWithdrawDialog(true);
  // }, [stakes, selectedStakes]);

  // console.log(selectedStakes);

  return (
    <Grid container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            WALLET BALANCE
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} $FLASH`}>
              <span>{trunc(walletBalance)} $FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            DAPP BALANCE
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
            <Typography variant="overline" className={classes.redText}>
              CONNECT YOUR WALLET TO VIEW YOUR STAKES
            </Typography>
          </Grid>
        ) : chainId !== 4 ? (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="overline" className={classes.redText}>
              CHANGE NETWORK TO RINKEBY TO UNSTAKE TOKENS
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
                      const _daysRem = Math.ceil(
                        (_stake.expiryTime - Date.now() / 1000) / 60
                      );
                      return (
                        // <a
                        //   href={`https://rinkeby.etherscan.io/tx/${_stake.transactionHash}`}
                        //   className={classes.link}
                        //   target="_blank"
                        // >
                        <Grid
                          container
                          item
                          xs={12}
                          key={_stake.id}
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
                              title={`${_stake.amountAvailable}/${_stake.stakeAmount} $FLASH`}
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
                                {_daysRem} {_daysRem === 1 ? "HOUR" : "HOURS"}
                              </Fragment>
                            ) : (
                              "COMPLETED"
                            )}
                            {isStakesSelected ? (
                              <Checkbox
                                size="small"
                                checked={
                                  selectedStakes[_stake.id] ? true : false
                                }
                                className={classes.checkbox}
                              />
                            ) : null}
                          </Grid>
                        </Grid>
                      );
                    })}
                </Grid>
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
                      variant="overline"
                      className={classes.disabledText}
                      // onClick={toggleTable}
                    >
                      SELECT STAKES TO WITHDRAW SPECIFIC ONES
                    </Typography>
                  </Grid>
                  <Grid item xs={12} className={classes.gridItem2}>
                    <Button
                      variant="retro"
                      fullWidth
                      onClick={
                        isStakesSelected ? onClickUnstake2 : onClickUnstake
                      }
                      disabled={
                        // !isStakesSelected
                        //   ? loadingRedux.unstake || !(expiredDappBalance > 0)
                        //   : !isStakesSelected
                        loadingRedux.unstake || !(dappBalance > 0)
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
              <Typography variant="overline" className={classes.msg}>
                NO AVAILABLE STAKES
              </Typography>
            </Grid>
          )
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="overline">
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
  dashboard: { selectedStakes, isStakesSelected },
  ui: { loading },
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
});

export default connect(mapStateToProps, {
  showWalletBackdrop,
  unstakeXIO,
  selectStake,
  clearSelection,
})(TableComponent);
