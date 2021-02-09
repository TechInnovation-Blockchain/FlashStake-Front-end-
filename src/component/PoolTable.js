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
import RemoveLiquidityDropDown from "./RemoveLiquidityDropDown";
import {
  showWalletBackdrop,
  setExpandAccodion,
} from "../redux/actions/uiActions";
import { trunc } from "../utils/utilFunc";
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import {
  unstakeXIO,
  onSelectWithdrawPool,
  removeTokenLiquidityInPool,
  checkAllowancePoolWithdraw,
  getApprovalPoolLiquidity,
  setSelectedRewardToken,
} from "../redux/actions/flashstakeActions";
import { selectStake } from "../redux/actions/dashboardActions";
import Radio from "@material-ui/core/Radio";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddLiquidityDropDown from "./AddLiquidityDropDown";
import Web3 from "web3";
import { utils } from "ethers";
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
  linkText: {
    cursor: "pointer",
    color: theme.palette.xioRed.main,
    fontWeight: 600,
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
  lastHead: {
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
  gridSpacing: {
    padding: theme.spacing(0, 1),
    paddingBottom: theme.spacing(1),
  },
  expandBtn: {
    color: theme.palette.button.retro,
  },
  accordion: {
    marginBottom: theme.spacing(1),
    width: "100%",

    "&.MuiAccordion-root.Mui-expanded": {
      marginTop: "0 !important",
    },
  },

  heading: {
    fontWeight: 500,
  },
  accordionSummary: {
    margin: 0,
  },
  accordionDetails: {
    display: "block !important",
    ".MuiAccordionDetails-root": {
      display: "block !important",
    },
  },
  border: {
    borderBottom: `1px solid #000`,
    width: "80%",
  },
  outerBox: {
    display: "flex",
    width: "100%",
  },
  innerBox: {
    width: "100%",
    margin: theme.spacing(0.5, 0),
    fontWeight: 500,
  },
  innerText: {
    textAlign: "left",
  },
  btns: {
    display: "flex",
    margin: "0 !important",
  },
  fontWeight: {
    fontWeight: 500,
  },
  liqBtn: {
    background: theme.palette.button.retro,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    cursor: "pointer",

    "&:hover": {
      background: theme.palette.button.hover,
    },
  },
  liqBtnInner: {
    // backgroundColor: theme.palette.button.retro,
    border: "none",
    // height: 35,
    color: theme.palette.buttonText.dark,
    letterSpacing: 2,
    lineHeight: 1.2,
    borderRadius: theme.palette.ButtonRadius.small,
    fontWeight: 500,
  },
}));

function PoolTable({
  active,
  account,
  chainId,
  showWalletBackdrop,
  walletBalance,
  poolDashboard,
  selectedWithdrawPool,
  checkAllowancePoolWithdraw,
  selectedRewardToken,
  allPoolsData,
  selectedQueryData,
  onClickPool,
  setShowStakeDialog,
  theme,
  setExpandAccodion,
  setSelectedRewardToken,
  importToken,
}) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [poolsLiquidityList, setPoolsLiquidityList] = useState([]);
  const [addLiqOpen, setAddLiqOpen] = useState(false);
  const [remLiqOpen, setRemLiqOpen] = useState(false);
  const [currentPool, setCurrentPool] = useState({});
  const [percentageToRemove, setPercentageToRemove] = useState(5);
  const [toExpand, setToExpand] = useState("");

  const onClickOpen = (_pool, type = "add") => {
    setCurrentPool(_pool);
    type === "add" ? addLiquidity(_pool) : setRemLiqOpen(true);
  };

  const addLiquidity = (_pool) => {
    setSelectedRewardToken(_pool?.pool);
    setExpandAccodion(false);
  };

  const onClickClose = (type = "add") => {
    type === "add" ? setAddLiqOpen(false) : setRemLiqOpen(false);
  };

  useEffect(() => {
    setPage(0);
  }, [poolDashboard]);

  // useEffect(() => {
  //   if (
  //     poolsLiquidityList.length &&
  //     currentPool?.pool?.id !== poolsLiquidityList[0].pool.id
  //   ) {
  //     onClickOpen(poolsLiquidityList[0], "add");
  //   }
  // }, [poolsLiquidityList]);

  const handleChange = (_expanded) => (event, newExpanded) => {
    setToExpand(newExpanded ? _expanded : false);
  };

  useEffect(() => {
    if (selectedRewardToken?.id) {
      const _pool = poolsLiquidityList.find(
        (__pool) => __pool.pool.id === selectedRewardToken.id
      );
      setCurrentPool(_pool || { pool: selectedRewardToken });
    }
  }, [selectedRewardToken]);

  useEffect(() => {
    setPoolsLiquidityList(
      poolDashboard.map((_pool) => {
        const poolQueryData = allPoolsData[_pool.pool.id];
        let _percentageShare = 0;
        let pooledFlash = 0;
        let pooledAlt = 0;
        if (poolQueryData) {
          _percentageShare =
            _pool.balance /
            utils.formatUnits(poolQueryData.poolTotalSupply.toString(), 18);
          pooledFlash =
            _percentageShare *
            utils.formatUnits(poolQueryData.reserveFlashAmount.toString(), 18);
          pooledAlt =
            _percentageShare *
            utils.formatUnits(
              poolQueryData.reserveAltAmount.toString(),
              _pool?.pool?.tokenB?.decimal
            );
        }
        return {
          ..._pool,
          poolQueryData,
          pooledFlash,
          pooledAlt,
          poolShare: _percentageShare * 100,
        };
      })
    );
  }, [poolDashboard, allPoolsData]);

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

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
            <Tooltip title={`${walletBalance} FLASH`}>
              <span> {poolDashboard?.length || 0} </span>
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.lastHead}>
          <Typography variant="overline">
            <a href={CONSTANTS.STATS_PAGE} target="_blank">
              {" "}
              <b className={classes.linkText}>SEE CHARTS AND STATS</b>
            </a>
          </Typography>
        </Grid>
      </Grid>

      {!(active && account) ? (
        <Grid
          item
          xs={12}
          className={`${classes.msgContainer} ${classes.cursorPointer}`}
          onClick={showWalletHint}
        >
          <Typography variant="body2" className={classes.redText}>
            Connect wallet to view your pools
          </Typography>
        </Grid>
      ) : (
        <Fragment>
          <PageAnimation in={true} key={page} reverse={false}>
            <Grid container className={classes.gridSpacing} item>
              {poolsLiquidityList.length > 0 ? (
                chainId !== CONSTANTS.CHAIN_ID ? null : (
                  poolsLiquidityList.map((_pool) => (
                    <Accordion
                      className={classes.accordion}
                      key={_pool.pool.id}
                      // onClick={() => {
                      //   setToExpand(_pool.pool.id);
                      // }}
                      expanded={toExpand === _pool.pool.id}
                      onChange={handleChange(_pool.pool.id)}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon
                            size={"large"}
                            className={classes.expandBtn}
                          />
                        }
                        className={classes.accordionSummary}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        {/* {Object.Keys(poolDataBalance).filter(id)=> } */}
                        <Typography className={classes.heading}>
                          FLASH / {_pool.pool.tokenB.symbol}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails className={classes.accordionDetails}>
                        <Grid xs={12} className={classes.outerBox}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Your total pool tokens:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={_pool?.balance || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(_pool?.balance || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} className={classes.outerBox}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Pooled FLASH:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={_pool.pooledFlash || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(_pool.pooledFlash || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} className={classes.outerBox}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Pooled {_pool.pool.tokenB.symbol}:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={_pool.pooledAlt || 0}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(_pool.pooledAlt || 0)}
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid xs={12} className={classes.outerBox}>
                          <Grid
                            xs={6}
                            style={{ textAlign: "left" }}
                            className={classes.innerBox}
                          >
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              Your pool share:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Tooltip title={`${_pool.poolShare || 0}%`}>
                              <Typography
                                variant="body2"
                                className={classes.fontWeight}
                              >
                                {trunc(_pool.poolShare || 0)}%
                              </Typography>
                            </Tooltip>
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          xs={12}
                          spacing={2}
                          className={classes.btns}
                        >
                          <Grid item xs={6} className={classes.innerBox}>
                            <Box
                              className={classes.liqBtn}
                              onClick={() => onClickOpen(_pool, "rem")}
                            >
                              <Typography
                                variant="body1"
                                className={classes.liqBtnInner}
                              >
                                REMOVE
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} className={classes.innerBox}>
                            <Box
                              className={classes.liqBtn}
                              onClick={() => onClickOpen(_pool, "add")}
                            >
                              <Typography
                                variant="body1"
                                className={classes.liqBtnInner}
                              >
                                ADD
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )
              ) : (
                <Grid item xs={12} className={classes.msgContainer}>
                  <Typography variant="overline">NO POOLS AVAILABLE</Typography>
                </Grid>
              )}

              <Grid item xs={12} className={classes.msgContainer}>
                <Typography variant="overline">
                  DON'T SEE A POOL YOU JOINED?
                  <br />
                  <b onClick={importToken} className={classes.linkText}>
                    ADD TOKEN TO SEE LP BALANCE
                  </b>
                </Typography>
              </Grid>
            </Grid>
          </PageAnimation>
          <AddLiquidityDropDown
            open={addLiqOpen}
            pool={currentPool}
            onClose={() => onClickClose("add")}
            queryData={selectedQueryData}
            onClickPool={onClickPool}
            theme={theme}
          />
          <RemoveLiquidityDropDown
            open={remLiqOpen}
            pool={currentPool}
            percentageToRemove={percentageToRemove}
            setPercentageToRemove={setPercentageToRemove}
            onClose={() => {
              onClickClose("rem");
              setPercentageToRemove(5);
            }}
            queryData={selectedQueryData}
            selectedRewardToken={selectedRewardToken}
            currentPool={currentPool}
            setShowStakeDialog={setShowStakeDialog}
            setRemLiqOpen={setRemLiqOpen}
          />
        </Fragment>
      )}
    </Grid>
  );
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  user: {
    stakes,
    walletBalance,
    dappBalance,
    expiredDappBalance,
    poolDataBalance,
    pools,
  },
  dashboard: { selectedStakes, isStakesSelected },
  ui: { loading, theme },
  flashstake: {
    poolDashboard,
    selectedWithdrawPool,
    allowancePoolWithdraw,
    selectedRewardToken,
    selectedStakeToken,
  },
  query: { allPoolsData },
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
  selectedRewardToken,
  selectedStakeToken,
  poolDataBalance,
  pools,
  allPoolsData,
  theme,
});

export default connect(mapStateToProps, {
  showWalletBackdrop,
  unstakeXIO,
  onSelectWithdrawPool,
  selectStake,
  removeTokenLiquidityInPool,
  getApprovalPoolLiquidity,
  checkAllowancePoolWithdraw,
  setExpandAccodion,
  setSelectedRewardToken,
})(PoolTable);
