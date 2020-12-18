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
  Radio,
} from "@material-ui/core";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import { UnfoldMore } from "@material-ui/icons";

import { showWalletBackdrop, setHeightValue } from "../redux/actions/uiActions";
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
import { useHistory } from "react-router-dom";

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

const CreateTable = ({
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
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [height, setHeight] = useState(heightVal);
  const ref = useRef(null);

  const toggle = () => {
    setHeight(height > 300 ? heightVal : "100%");
  };

  useEffect(() => {
    // if (history.location.pathname === "/stake") {
    toggle();
    // }
  }, []);

  const showWalletHint = useCallback(() => {
    if (!(active && account)) {
      showWalletBackdrop(true);
    }
  }, [active, account, showWalletBackdrop]);

  return (
    <Grid ref={ref} container spacing={3} className={classes.walletInfo}>
      <Grid container item xs={12} className={classes.infoGrid}>
        <Grid item xs={12} className={classes.grid}>
          <Typography className={classes.mainHead} variant="body1">
            ENTRIES
          </Typography>
          <Typography className={classes.secHead} variant="h6">
            {/* <Tooltip title={`${walletBalance} FLASH`}> */}
            <span> 03</span>
            {/* </Tooltip> */}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CreateTable;
