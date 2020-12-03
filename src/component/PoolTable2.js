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
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import {
  unstakeXIO,
  onSelectWithdrawPool,
  removeTokenLiquidityInPool,
  checkAllowancePoolWithdraw,
  getApprovalPoolLiquidity,
} from "../redux/actions/flashstakeActions";
import { selectStake } from "../redux/actions/dashboardActions";
import Radio from "@material-ui/core/Radio";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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

  radio: {
    padding: "0 !important",
    "&$checked": {
      color: theme.palette.xioRed.main,
    },
  },
  checked: {
    color: theme.palette.xioRed.main,
  },
}));

function PoolTable({
  stakes,
  loading,
  loadingRedux,
  active,
  account,
  chainId,
  showWalletBackdrop,
  walletBalance,
  dappBalance,
  expiredDappBalance,
  poolDashboard,
  selectedWithdrawPool,
  onSelectWithdrawPool,
  removeTokenLiquidityInPool,
  allowancePoolWithdraw,
  onClickUnstake,
  checkAllowancePoolWithdraw,
  onClickApprovePool,
  getApprovalPoolLiquidity,
}) {
  const classes = useStyles();
  const headItems = ["POOL", "BALANCE"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [visibleRadioButtons, setVisibleRadioButtons] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [poolDashboard]);

  useEffect(() => {
    if (!selectedWithdrawPool) {
      setVisibleRadioButtons(false);
    }
  }, [selectedWithdrawPool]);

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
      case "POOL":
        data = poolDashboard?.sort(
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
      case "BALANCE":
        data = poolDashboard?.sort(
          ({ balance: a }, { balance: b }) => parseFloat(a) - parseFloat(b)
        );
        break;
      default:
        data = poolDashboard;
        // data = stakes.reverse();
        break;
    }
    return sortDirection ? data.reverse() : data;
  }, [poolDashboard, sortBy, sortDirection]);

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

  useEffect(() => {
    checkAllowancePoolWithdraw();
  }, [active, account, selectedWithdrawPool]);

  return (
    <Grid container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={12} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            POOLS
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${walletBalance} $FLASH`}>
              <span> {poolDashboard.length} </span>
              {/* <span>{trunc(walletBalance)} $FLASH</span> */}
            </Tooltip>
          </Typography>
        </Grid>

        {/* <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead} variant="overline">
            COMPLETED POOLS
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            <Tooltip title={`${dappBalance} $FLASH`}>
              <span> {poolDashboard.length} </span>
              {/* <span>{trunc(dappBalance)} $FLASH</span>  
            </Tooltip>
          </Typography>
        </Grid> */}
      </Grid>

      <Grid container item xs={12}>
        <Grid container item xs={12} className={classes.gridHead}>
          {headItems.map((headItem) => (
            <Grid
              item
              xs={6 - visibleRadioButtons}
              className={classes.gridItem}
              key={headItem}
            >
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
              CHANGE NETWORK TO RINKEBY TO ADD/REMOVE LIQUIDITY
            </Typography>
          </Grid>
        ) : !loading ? (
          poolDashboard?.length ? (
            <Fragment>
              <PageAnimation in={true} key={page} reverse={reverse}>
                <Grid container>
                  {sortedData()
                    .slice(page * 5, page * 5 + 5)
                    .map((_pool) => {
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
                          key={_pool.pool.id}
                          className={classes.cursorPointer}
                          onClick={() =>
                            visibleRadioButtons &&
                            onSelectWithdrawPool(_pool.pool.id)
                          }
                          // onClick={() => selectStake(_stake.id)}
                          // className={`${classes.cursorPointer} ${
                          //   selectedStakes[_stake.id] ? classes.selected : null
                          // }`}
                        >
                          <Grid
                            item
                            xs={6 - visibleRadioButtons}
                            className={classes.gridItem}
                          >
                            {/* <Tooltip
                            title={`${_stake.rewardEarned} ${_stake.tokenB}`}
                          > */}
                            <span className={classes.flexCenter}>
                              <img
                                src={tryRequire(_pool.pool.tokenB.symbol)}
                                alt="Logo"
                                srcSet=""
                                width={15}
                                style={{ marginRight: 5 }}
                              />
                              {_pool.pool.tokenB.symbol}
                            </span>
                            {/* </Tooltip> */}
                          </Grid>
                          <Grid
                            item
                            xs={6 - visibleRadioButtons}
                            className={classes.gridItem}
                          >
                            <Tooltip title={`${_pool.balance} xFlash`}>
                              <span className={classes.flexCenter}>
                                <img
                                  src={tryRequire("$FLASH")}
                                  alt="Logo"
                                  srcSet=""
                                  width={15}
                                  style={{ marginRight: 5 }}
                                />
                                {trunc(_pool.balance)} xFlash
                              </span>
                            </Tooltip>
                          </Grid>

                          {visibleRadioButtons ? (
                            <Grid item xs={2} className={classes.gridItem}>
                              <Radio
                                classes={{
                                  root: classes.radio,
                                  checked: classes.checked,
                                }}
                                checked={_pool.pool.id === selectedWithdrawPool}
                                // onChange={onSelectWithdrawPool}
                                // onChange={({ target: { value } }) =>
                                //   onSelectWithdrawPool(value)
                                // }
                                // checked={selectedValue === "a"}
                                // onChange={handleChange}
                                value={_pool.pool.id}
                                name="radio-button-demo"
                                inputProps={{ "aria-label": "A" }}
                              />
                            </Grid>
                          ) : null}
                        </Grid>
                        // </a>
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
              {sortedData().length ? (
                allowancePoolWithdraw ? (
                  <Grid item xs={12} className={classes.gridItem}>
                    <Button
                      variant="retro"
                      fullWidth
                      // onClick={() => {
                      //   onClickUnstake();
                      //   unstakeXIO();
                      // }}
                      onClick={
                        visibleRadioButtons
                          ? () => {
                              onClickUnstake();
                              removeTokenLiquidityInPool();
                            }
                          : () => setVisibleRadioButtons(true)
                      }
                      disabled={
                        loadingRedux.withdrawPool ||
                        (visibleRadioButtons && !selectedWithdrawPool)
                      }
                      fontSizeLocal="body2"
                      loading={loadingRedux.withdrawPool}
                    >
                      {visibleRadioButtons && selectedWithdrawPool
                        ? "WITHDRAW LIQUIDITY FROM SELECTED POOL"
                        : "WITHDRAW"}
                    </Button>
                  </Grid>
                ) : (
                  <Grid item xs={12} className={classes.gridItem}>
                    <Button
                      variant="retro"
                      fullWidth
                      onClick={
                        visibleRadioButtons
                          ? () => {
                              onClickApprovePool();
                              getApprovalPoolLiquidity();
                            }
                          : () => setVisibleRadioButtons(true)
                      }
                      disabled={
                        loadingRedux.withdrawPool ||
                        (visibleRadioButtons && !selectedWithdrawPool)
                      }
                      fontSizeLocal="body2"
                      loading={
                        loadingRedux.approval ||
                        loadingRedux.approvalWithdrawPool
                      }
                    >
                      APPROVE xFLASH
                    </Button>
                  </Grid>
                )
              ) : null}
            </Fragment>
          ) : (
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="overline" className={classes.msg}>
                NO AVAILABLE POOLS
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
  flashstake: { poolDashboard, selectedWithdrawPool, allowancePoolWithdraw },
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
  poolDashboard,
  selectedWithdrawPool,
  allowancePoolWithdraw,
});

export default connect(mapStateToProps, {
  showWalletBackdrop,
  unstakeXIO,
  onSelectWithdrawPool,
  selectStake,
  removeTokenLiquidityInPool,
  getApprovalPoolLiquidity,
  checkAllowancePoolWithdraw,
})(PoolTable);
