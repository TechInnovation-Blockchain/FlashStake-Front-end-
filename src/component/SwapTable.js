import React, { useState, useCallback, Fragment, useEffect } from "react";
import {
  Button as MuiButton,
  IconButton,
  Grid,
  Tooltip,
  Typography,
  CircularProgress,
  TablePagination,
  Checkbox,
  Box,
} from "@material-ui/core";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { UnfoldMore, Pageview } from "@material-ui/icons";
import Web3 from "web3";

import Logout from "./LogoutIcon";
import { showWalletBackdrop } from "../redux/actions/uiActions";
import logout from "../assets/logout.svg";
import { trunc } from "../utils/utilFunc";
import Button from "./Button";
import PageAnimation from "./PageAnimation";
import { selectStake } from "../redux/actions/dashboardActions";

const useStyles = makeStyles((theme) => ({
  gridHead: {
    borderBottom: `1px solid ${theme.palette.border.main}`,
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
    fontSize: 10,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
  sortIcon: {
    color: theme.palette.xioRed.main,
  },
  tableHeadItemBtn: {
    fontWeight: 700,
    fontSize: 10,
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
    fontSize: 9,
    fontWeight: 700,
    color: theme.palette.text.grey,
    margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  secHead: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.palette.text.primary,
    margin: theme.spacing(2, 0),
    textAlign: "center",
  },
  sortButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
  selectStake,
  selectedStakes,
  isStakesSelected,
  pools,
}) {
  const classes = useStyles();
  const headItems = ["INPUT", "OUTPUT XIO", "DATE"];

  const [sortDirection, setSortDirection] = useState(false);
  const [sortBy, setSortBy] = useState("EARNED");
  const [page, setPage] = useState(0);
  const [reverse, setReverse] = useState(false);

  const history = useHistory();

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
        data = currentStaked?.stakes?.sort(({ tokenB: a }, { tokenB: b }) => {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });

        break;
      case "XIO":
        data = currentStaked?.stakes?.sort(
          (a, b) =>
            parseFloat(a.stakeAmountAvailable) -
            parseFloat(b.stakeAmountAvailable)
        );
        break;
      case "DATE":
        data = currentStaked?.stakes?.sort(
          (a, b) => parseFloat(a.expiry) - parseFloat(b.expiry)
        );
        break;
      default:
        data = currentStaked?.stakes;
        break;
    }
    return sortDirection ? data.reverse() : data;
  }, [currentStaked, sortBy, sortDirection]);

  const handleChangePage = useCallback(
    (event, newPage) => {
      setReverse(newPage < page);
      setPage(newPage);
    },
    [page]
  );

  return (
    <Grid container>
      <Grid container item spacing={2} xs={12} className={classes.infoGrid}>
        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead}>WALLET BALANCE</Typography>
          <Typography className={classes.secHead}>$252,503</Typography>
        </Grid>

        <Grid item xs={6} className={classes.grid}>
          <Typography className={classes.mainHead}>XIO BALANCE</Typography>
          <Typography className={classes.secHead}>5,000 XIO</Typography>
        </Grid>
      </Grid>

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
            CONNECT YOUR WALLET TO VIEW YOUR SWAPS
          </Typography>
        </Grid>
      ) : chainId !== 4 ? (
        <Grid item xs={12} className={classes.msgContainer}>
          <Typography variant="body2" className={classes.redText}>
            CHANGE NETWORK TO RINKEBY TO WITHDRAW TOKENS
          </Typography>
        </Grid>
      ) : !loading ? (
        currentStaked?.stakes?.length ? (
          <Fragment>
            <PageAnimation in={true} key={page} reverse={reverse}>
              <Grid container>
                {sortedData()
                  .slice(page * 5, page * 5 + 5)
                  .map((_stake) => {
                    const _daysRem = Math.ceil(
                      (_stake.expiry - Date.now() / 1000) / 60
                    );
                    return (
                      <Grid
                        container
                        item
                        xs={12}
                        onClick={() => selectStake(_stake.id)}
                        className={`${classes.cursorPointer} ${
                          selectedStakes[_stake.id] ? classes.selected : null
                        }`}
                      >
                        <Grid item xs={4} className={classes.gridItem}>
                          <Tooltip
                            title={`${_stake.rewardEarned} ${_stake.tokenB}`}
                          >
                            <span className={classes.flexCenter}>
                              <img
                                src={require(`../assets/Tokens/${_stake.tokenB}.png`)}
                                alt="Logo"
                                srcset=""
                                width={15}
                                style={{ marginRight: 5 }}
                              />
                              {_stake.tokenB}
                            </span>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={4} className={classes.gridItem}>
                          <Tooltip
                            title={`${_stake.stakeAvailable}/${_stake.stakeAmountConverted} ${_stake.tokenA}`}
                          >
                            <span>
                              {trunc(_stake.stakeAvailable)}/
                              {trunc(_stake.stakeAmountConverted)}{" "}
                              {_stake.tokenA}
                            </span>
                          </Tooltip>
                        </Grid>

                        <Grid item xs={4} className={classes.gridItem}>
                          {!_stake.expired ||
                          _stake.expiry > Date.now() / 1000 ? (
                            <Fragment>
                              {_daysRem} {_daysRem === 1 ? "DAY" : "DAYS"}
                            </Fragment>
                          ) : (
                            "COMPLETED"
                          )}
                          {isStakesSelected ? (
                            <Checkbox
                              size="small"
                              checked={selectedStakes[_stake.id] ? true : false}
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
            <Grid item xs={12} className={classes.msgContainer}>
              <Typography variant="body2" className={classes.secondaryText}>
                SELECT TO WITHDRAW SPECIFIC STAKES
              </Typography>
            </Grid>
          </Fragment>
        ) : (
          <Grid item xs={12} className={classes.msgContainer}>
            <Typography variant="body2" className={classes.msg}>
              NO AVAILABLE SWAPS
            </Typography>
            <Button variant="red" onClick={() => history.push("/flashstake")}>
              SWAP NOW
            </Button>
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
  );
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  user: { currentStaked, pools },
  dashboard: { selectedStakes, isStakesSelected },
}) => ({
  currentStaked,
  active,
  account,
  chainId,
  selectedStakes,
  isStakesSelected,
  pools,
});

export default connect(mapStateToProps, { showWalletBackdrop, selectStake })(
  SwapTable
);
