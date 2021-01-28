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
import { CONSTANTS } from "../utils/constants";

const useStyles = makeStyles((theme) => ({
  gridHead: {
    borderBottom: `1px solid ${theme.palette.border.gray}`,
  },
  gridItem: {
    ...theme.typography.body2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 500,

    margin: theme.spacing(1, 0),
  },
  flexCenter: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  redText: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
    fontWeight: 500,
  },
  tableHeadItemBtn: {
    fontWeight: 500,
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
    background: theme.palette.background.selected,
  },
  checkbox: {
    padding: 0,
    "&.Mui-checked": {
      color: theme.palette.xioRed.main,
    },
  },
  mainHead: {
    fontWeight: 600,
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
  link: {
    textDecoration: "none",
    display: "contents",
  },
  swapHistBox: {
    background: theme.palette.background.historyTableBox,
    padding: theme.spacing(1.5, 0),
    margin: theme.spacing(1, 0),
    borderRadius: 5,
  },
  swappedFlash: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "600",
    paddingBottom: 10,
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
  theme,
}) {
  const classes = useStyles();
  const headItems = ["INPUT", "OUTPUT"];
  // const headItems = ["QUANTITY", "INPUT", "OUTPUT"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState("QUANTITY");
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

  const sortedData = useCallback(() => {
    let data = [];
    switch (sortBy) {
      case "INPUT":
        data = swapHistory?.sort(
          ({ swapAmount: a }, { swapAmount: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      case "OUTPUT":
        data = swapHistory?.sort(
          ({ flashReceived: a }, { flashReceived: b }) =>
            parseFloat(a) - parseFloat(b)
        );
        break;
      case "QUANTITY":
        data = swapHistory?.sort(
          ({ swapAmount: a }, { swapAmount: b }) =>
            parseFloat(b) - parseFloat(a)
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
          <Typography className={classes.mainHead} variant="body2">
            Wallet Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`$${balanceUSD}`}>
              <span>${trunc(balanceUSD)}</span>
            </Tooltip>
          </Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body2">
            FLASH Balance
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} FLASH`}>
              <span>{trunc(walletBalance)} FLASH</span>
            </Tooltip>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid container item xs={12} className={classes.gridHead}>
          {headItems.map((headItem, index) => (
            <Grid item xs={6} className={classes.gridItem} key={headItem}>
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
              Connect wallet to view your swap history
            </Typography>
          </Grid>
        ) : !loading ? (
          swapHistory?.length ? (
            chainId !== CONSTANTS.CHAIN_ID ? null : (
              <Fragment>
                <PageAnimation in={true} key={page} reverse={reverse}>
                  <Grid container>
                    {sortedData()
                      .slice(page * 5, page * 5 + 5)
                      .map((_swap, index) => {
                        return (
                          <a
                            href={`https://etherscan.io/tx/${_swap.transactionHash}`}
                            className={classes.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={_swap.id}
                          >
                            <Grid
                              container
                              item
                              xs={12}
                              key={_swap.id}
                              className={`${classes.cursorPointer} ${classes.swapHistBox} ${_swap.id}`}
                            >
                              <Grid item xs={6} className={classes.gridItem}>
                                <Tooltip
                                  title={`${_swap.swapAmount} ${_swap.pool.tokenB.symbol}`}
                                >
                                  <Box className={classes.flexCenter}>
                                    <span className={classes.swappedFlash}>
                                      <img
                                        src={tryRequire(
                                          _swap.pool.tokenB.symbol
                                        )}
                                        alt="Logo"
                                        srcSet=""
                                        width={20}
                                        style={{ marginRight: 5 }}
                                      />
                                      {_swap.pool.tokenB.symbol}
                                    </span>{" "}
                                    <Typography
                                      variant="h6"
                                      style={{ fontWeight: 700 }}
                                    >
                                      {trunc(_swap.swapAmount)}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                              {/* 
                              <Grid item xs={4} className={classes.gridItem}>
                              <Tooltip title={`${_swap.pool.tokenB.symbol}`}>
                                <span className={classes.flexCenter}>
                                  <img
                                    src={tryRequire(_swap.pool.tokenB.symbol)}
                                    alt="Logo"
                                    srcSet=""
                                    width={15}
                                    style={{ marginRight: 5 }}
                                  />{" "}
                                  {_swap.pool.tokenB.symbol}
                                </span>
                              </Tooltip>
                            </Grid> */}

                              <Grid item xs={6} className={classes.gridItem}>
                                <Tooltip title={`${_swap.flashReceived} FLASH`}>
                                  <Box className={classes.flexCenter}>
                                    <span className={classes.swappedFlash}>
                                      <img
                                        // src={tryRequire("FlashPro5")}
                                        src={tryRequire(
                                          theme === "dark"
                                            ? "FlashLogo"
                                            : "FLASH"
                                        )}
                                        alt="Logo"
                                        srcSet=""
                                        width={20}
                                        style={{ marginRight: 5 }}
                                      />
                                      FLASH
                                    </span>{" "}
                                    <Typography
                                      variant="h6"
                                      style={{ fontWeight: 700 }}
                                    >
                                      {trunc(_swap.flashReceived)}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              </Grid>
                            </Grid>
                          </a>
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
            )
          ) : (
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="body2" className={classes.msg}>
                No swap history
              </Typography>
            </Grid>
          )
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="overline" className={classes.loadingCenter}>
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
    theme,
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
  theme,
});

export default connect(mapStateToProps, { showWalletBackdrop })(SwapTable);
