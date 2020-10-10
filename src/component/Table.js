import React, { useState, useCallback, Fragment, useEffect } from "react";
import {
  Button as MuiButton,
  Grid,
  Tooltip,
  Typography,
  CircularProgress,
  TablePagination,
  Box,
} from "@material-ui/core";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { UnfoldMore } from "@material-ui/icons";
import Web3 from "web3";

import { showWalletBackdrop } from "../redux/actions/uiActions";
import { trunc } from "../utils/utilFunc";
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import { selectStake } from "../redux/actions/dashboardActions";
import { unstakeXIO } from "../redux/actions/flashstakeActions";

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
  selectStake,
  selectedStakes,
  isStakesSelected,
  walletBalance,
  dappBalance,
  unstakeXIO,
  expiredDappBalance,
  onClickUnstake,
}) {
  const classes = useStyles();
  const headItems = ["OUTPUT", "UNLOCKED", "REMAINING"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState("EARNED");
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);

  const history = useHistory();

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
  // // console.log(currentStaked);
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
          ({ stakeAmount: a }, { stakeAmount: b }) =>
            parseFloat(Web3.utils.fromWei(a)) -
            parseFloat(Web3.utils.fromWei(b))
        );
        break;
      case "REMAINING":
        data = stakes?.sort(
          (a, b) => parseFloat(a.expiryTime) - parseFloat(b.expiryTime)
        );
        break;
      default:
        data = stakes;
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
  return (
    <Grid container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            WALLET BALANCE
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} XIO`}>
              <span>{trunc(walletBalance)} XIO</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            DAPP BALANCE
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${dappBalance} XIO`}>
              <span>{trunc(dappBalance)} XIO</span>
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
                        <Grid
                          container
                          item
                          xs={12}
                          onClick={() => selectStake(_stake.id)}
                          className={classes.cursorPointer}
                        >
                          <Grid item xs={4} className={classes.gridItem}>
                            {/* <Tooltip
                            title={`${_stake.rewardEarned} ${_stake.tokenB}`}
                          > */}
                            <span className={classes.flexCenter}>
                              {/* <img
                                src={require(`../assets/Tokens/${_stake.pool.tokenB.symbol}.png`)}
                                alt="Logo"
                                srcset=""
                                width={15}
                                style={{ marginRight: 5 }}
                              /> */}
                              {_stake.pool.tokenB.symbol}
                            </span>
                            {/* </Tooltip> */}
                          </Grid>
                          <Grid item xs={4} className={classes.gridItem}>
                            <Tooltip
                              title={`${_stake.amountAvailable}/${_stake.stakeAmount} XIO`}
                            >
                              <span>
                                {trunc(_stake.amountAvailable)}/
                                {trunc(_stake.stakeAmount)}
                              </span>
                            </Tooltip>
                          </Grid>

                          <Grid item xs={4} className={classes.gridItem}>
                            {!_stake.expired ||
                            _stake.expiryTime > Date.now() / 1000 ? (
                              <Fragment>
                                {_daysRem} {_daysRem === 1 ? "DAY" : "DAYS"}
                              </Fragment>
                            ) : (
                              "COMPLETED"
                            )}
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
                <Grid item xs={12} className={classes.gridItem}>
                  <Button
                    variant="red"
                    fullWidth
                    onClick={() => {
                      onClickUnstake();
                      unstakeXIO();
                    }}
                    disabled={loadingRedux.unstake || !(expiredDappBalance > 0)}
                    fontSizeLocal="body2"
                    loading={loadingRedux.unstake}
                  >
                    <Tooltip title={`${expiredDappBalance} XIO`}>
                      <span>UNSTAKE</span>
                    </Tooltip>
                  </Button>
                </Grid>
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
  selectStake,
  unstakeXIO,
})(TableComponent);
