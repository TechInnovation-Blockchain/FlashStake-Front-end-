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
import AddLiquidityDropDown from "./AddLiquidityDropDown";

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
    fontWeight: 700,
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
    fontWeight: 700,
  },
  innerText: {
    textAlign: "left",
  },
  btns: {
    display: "flex",
    margin: "0 !important",
  },
  fontWeight: {
    fontWeight: 700,
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
  selectedRewardToken,
  selectedStakeToken,
  poolDataBalance,
  pools,
  poolItems,
  poolData,
}) {
  const classes = useStyles();
  const headItems = ["POOL", "BALANCE"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState();
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [_break, _setBreak] = useState(true);
  const [visibleRadioButtons, setVisibleRadioButtons] = useState(false);
  const [count, setCount] = useState(0);

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

  // stakes.find((_stake) => _stake.id === _ids[0])

  // const _pool = () => {
  // console.log(
  //   pools?.map((pool) =>
  //     pool.filter((id) => {
  //       return id === "0x0158e2b23003103bb138119f7278a60a2f755b27";
  //     })
  //   )
  // );
  //     pools.map((pool) =>
  //       pool.id.map((id) => {
  //         id;
  //       })
  //     )
  //   );
  // };

  // useEffect(() => {
  //   if (pools.length > 0) {
  //     pools.map((pool) => {
  //       console.log(Object.entries(pool));
  //     });
  //   }
  // });

  // useEffect(() => {
  //   // Object.keys(poolData).map((pool) => {
  //   console.log(poolData);
  //   // });
  // });

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
              <span> {count} </span>
              {/* <span>{trunc(walletBalance)} $FLASH</span> */}
            </Tooltip>
          </Typography>
        </Grid>
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
                {/* <Box className={classes.sortButton}>
                  <UnfoldMore fontSize="small" className={classes.sortIcon} />
                  {headItem}
                </Box> */}
              </MuiButton>
            </Grid>
          ))}
        </Grid>
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
      ) : (
        <Fragment>
          <PageAnimation in={true} key={page} reverse={reverse}>
            <Grid container className={classes.gridSpacing} item>
              {Object.keys(poolData).length > 0 ? (
                Object.keys(poolData).map((id, index) => {
                  return poolData[id].share > 0 ? (
                    <Accordion className={classes.accordion}>
                      {setCount(count + 1)}
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
                          {selectedStakeToken} /{" "}
                          {Object.values(poolItems)[index]}
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
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              {/* {console.log(poolData[id])} */}
                              {poolData[id]?.poolBalance}
                            </Typography>
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
                              Pooled $FLASH:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              {trunc(poolData[id]?.pooledFlash)}
                            </Typography>
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
                              Pooled AAVE:
                            </Typography>
                          </Grid>
                          <Grid xs={6} style={{ textAlign: "right" }}>
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              {trunc(poolData[id]?.pooledAlt)}
                            </Typography>
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
                            <Typography
                              variant="body2"
                              className={classes.fontWeight}
                            >
                              {poolData[id]?.share}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          xs={12}
                          spacing={2}
                          className={classes.btns}
                        >
                          <Grid item xs={6} className={classes.innerBox}>
                            <RemoveLiquidityDropDown
                              className={classes.dropDown}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.innerBox}>
                            <AddLiquidityDropDown
                              className={classes.dropDown}
                            />
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ) : null;
                })
              ) : (
                <Grid item xs={12} className={classes.msgContainer}>
                  <Typography variant="overline">
                    <CircularProgress size={12} /> LOADING
                  </Typography>
                </Grid>
              )}
            </Grid>
          </PageAnimation>
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
    poolItems,
    poolData,
  },
  dashboard: { selectedStakes, isStakesSelected },
  ui: { loading },
  flashstake: {
    poolDashboard,
    selectedWithdrawPool,
    allowancePoolWithdraw,
    selectedRewardToken,
    selectedStakeToken,
  },
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
  poolItems,
  poolData,
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
