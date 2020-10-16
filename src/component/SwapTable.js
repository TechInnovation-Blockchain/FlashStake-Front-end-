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
import { makeStyles } from "@material-ui/styles";
import { UnfoldMore } from "@material-ui/icons";
import { showWalletBackdrop } from "../redux/actions/uiActions";
import { trunc } from "../utils/utilFunc";
import PageAnimation from "./PageAnimation";

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
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  tableHeadItemBtn: {
    fontWeight: 700,
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
    fontWeight: 700,
    color: theme.palette.text.grey,
    margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  secHead: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    textAlign: "center",
  },
  sortButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    marginBottom: 2,
    marginRight: 5,
  },
}));

function SwapTable({
  currentStaked,
  openWithdrawDialog,
  loading,
  active,
  account,
  chainId,
  showWalletBackdrop,
  selectedStakes,
  isStakesSelected,
  pools,
  walletBalance,
  swapHistory,
  balanceUSD,
}) {
  const classes = useStyles();
  const headItems = ["INPUT", "OUTPUT XIO", "DATE"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [pools]);

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

  // // console.log("In Swap Table", pools);

  const sortedData = useCallback(() => {
    let data = [];
    switch (sortBy) {
      case "INPUT":
        data = swapHistory?.sort(
          ({ swapAmount: a }, { swapAmount: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      case "OUTPUT XIO":
        data = swapHistory?.sort(
          ({ xioReceived: a }, { xioReceived: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      case "DATE":
        data = swapHistory?.sort(
          ({ initiationTimestamp: a }, { initiationTimestamp: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      default:
        data = swapHistory;
        break;
    }
    return sortDirection ? data.reverse() : data;
  }, [swapHistory, sortBy, sortDirection]);

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
    <Grid container spacing={3}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            WALLET BALANCE
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`$${balanceUSD}`}>
              <span>${trunc(balanceUSD)}</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            XIO BALANCE
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} XIO`}>
              <span>{trunc(walletBalance)} XIO</span>
            </Tooltip>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid container item xs={12} className={classes.gridHead}>
          {headItems.map((headItem, index) => (
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
              CONNECT YOUR WALLET TO VIEW YOUR SWAPS
            </Typography>
          </Grid>
        ) : chainId !== 4 ? (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="overline" className={classes.redText}>
              CHANGE NETWORK TO RINKEBY TO VIEW YOUR SWAPS
            </Typography>
          </Grid>
        ) : !loading ? (
          swapHistory?.length ? (
            <Fragment>
              <PageAnimation in={true} key={page} reverse={reverse}>
                <Grid container>
                  {sortedData()
                    .slice(page * 5, page * 5 + 5)
                    .map((_swap, index) => {
                      return (
                        <Grid
                          container
                          item
                          xs={12}
                          key={_swap.id}
                          className={`${classes.cursorPointer} ${_swap.id}`}
                        >
                          <Grid item xs={4} className={classes.gridItem}>
                            <Tooltip
                              title={`${_swap.swapAmount} ${_swap.pool.tokenB.symbol}`}
                            >
                              <span className={classes.flexCenter}>
                                <img
                                  src={tryRequire(_swap.pool.tokenB.symbol)}
                                  alt="Logo"
                                  srcSet=""
                                  width={15}
                                  style={{ marginRight: 5 }}
                                />{" "}
                                {trunc(_swap.swapAmount)}{" "}
                                {_swap.pool.tokenB.symbol}
                              </span>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={4} className={classes.gridItem}>
                            <Tooltip title={`${_swap.xioReceived} XIO`}>
                              <span className={classes.flexCenter}>
                                <img
                                  src={tryRequire("XIO")}
                                  alt="Logo"
                                  srcSet=""
                                  width={15}
                                  style={{ marginRight: 5 }}
                                />{" "}
                                {trunc(_swap.xioReceived)} XIO
                              </span>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={4} className={classes.gridItem}>
                            {new Date(
                              _swap.initiationTimestamp * 1000
                            ).toLocaleDateString()}
                          </Grid>
                        </Grid>
                      );
                    })}
                </Grid>
              </PageAnimation>
              {swapHistory?.length > 5 ? (
                <Grid item xs={12} className={classes.gridItem}>
                  <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={swapHistory.length}
                    rowsPerPage={5}
                    page={page}
                    onChangePage={handleChangePage}
                    labelRowsPerPage=""
                    nextIconButtonProps={{ color: "primary" }}
                  />
                </Grid>
              ) : null}
            </Fragment>
          ) : (
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="overline" className={classes.msg}>
                NO AVAILABLE SWAPS
              </Typography>
            </Grid>
          )
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="overline" className={classes.flexCenter}>
              <CircularProgress size={12} className={classes.loadingIcon} />{" "}
              LOADING
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  flashstake: { balanceUSD },
  user: { currentStaked, pools, walletBalance, swapHistory },
  dashboard: { selectedStakes, isStakesSelected },
  ui: {
    loading: { data },
  },
}) => ({
  balanceUSD,
  currentStaked,
  active,
  account,
  chainId,
  selectedStakes,
  isStakesSelected,
  pools,
  walletBalance,
  swapHistory,
  loading: data,
});

export default connect(mapStateToProps, { showWalletBackdrop })(SwapTable);
