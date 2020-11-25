import { useEffect, useCallback } from "react";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import { setLoading } from "../redux/actions/uiActions";
import {
  setRefetch,
  setReCalculateExpired,
  setStakeStatus,
} from "../redux/actions/dashboardActions";
import {
  updatePools,
  updateUserData,
  clearUserData,
  updateAllBalances,
  setPoolData,
  setPoolDataBalance,
} from "../redux/actions/userActions";
import { userStakesQuery } from "../graphql/queries/userStakesQuery";
import {
  getBalanceXIO,
  getBalanceALT,
  checkAllowance,
} from "../redux/actions/flashstakeActions";
import { analytics } from "./App";
import { updateOneDay } from "../redux/actions/contractActions";
import { getQueryData } from "../redux/actions/queryActions";
import { getPoolBalances } from "../utils/contractFunctions/balanceContractFunctions";
import axios from "axios";

function Updater({
  active,
  account,
  chainId,
  updatePools,
  updateUserData,
  refetchData,
  setRefetch,
  setLoading,
  currentStaked,
  reCalculateExpired,
  setReCalculateExpired,
  getBalanceXIO,
  getBalanceALT,
  updateAllBalances,
  checkAllowance,
  clearUserData,
  selectedPortal,
  updateOneDay,
  oneDay,
  setPoolData,
  setPoolDataBalance,
  poolData,
  getQueryData,
  stakeStatus,
  setStakeStatus,
  isStakesSelected,
  selectedStakes,
  totalBurn,
  // getPoolBalances,
}) {
  const { loading, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    getPoolBalances();
  });

  useEffect(() => {
    updateOneDay();
  }, []);

  useEffect(() => {
    if (active && account) {
      analytics.setUserId(account);
      analytics.logEvent("USER_WALLET_ACTIVATED", {
        address: `Address -> ${account}`,
      });
      refetch();
      const _interval = window.setInterval(() => {
        updateAllBalances();
      }, 60000);
      updateAllBalances();
      // getBalanceALT();
      checkAllowance();
      return () => window.clearInterval(_interval);
    } else {
      clearUserData();
    }
  }, [active, account]);

  useEffect(() => {
    if (selectedPortal) {
      updateAllBalances();
    }
  }, [selectedPortal]);

  useEffect(() => {
    const earliestRemaining = currentStaked.earliest - Date.now() / 1000;
    if (earliestRemaining > 0) {
      let _reCalc = setTimeout(
        () => setReCalculateExpired(true),
        earliestRemaining * 1000
      );
      return () => {
        clearTimeout(_reCalc);
      };
    }
  }, [currentStaked.earliest, setReCalculateExpired]);

  useEffect(() => {
    if (reCalculateExpired && data) {
    }
    setReCalculateExpired(false);
  }, [reCalculateExpired, data, setReCalculateExpired]);

  useEffect(() => {
    setLoading({ data: loading });
    if (!loading && data) {
    }
  }, [loading, data, setLoading]);

  useEffect(() => {
    if (refetchData) {
      refetch();
      // getBalanceXIO();
      // getBalanceALT();
      checkAllowance();
      updateAllBalances();
      setRefetch(false);
    }
  }, [refetchData]);
  useEffect(() => {
    updatePools(data?.protocols[0]?.pools);
    updateUserData(data?.user);

    let reCalculateInterval = setInterval(() => {
      updateUserData(data?.user);
    }, 60000);
    return () => clearInterval(reCalculateInterval);
  }, [data, updatePools, updateUserData, oneDay]);

  return null;
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  dashboard: {
    refetch,
    reCalculateExpired,
    stakeStatus,
    totalBurn,
    isStakesSelected,
    selectedStakes,
  },
  user: { currentStaked, poolData },
  flashstake: { selectedPortal },
  contract: { oneDay },
}) => ({
  active,
  account,
  chainId,
  refetchData: refetch,
  currentStaked,
  reCalculateExpired,
  selectedPortal,
  oneDay,
  poolData,
  stakeStatus,
  isStakesSelected,
  selectedStakes,
});

export default connect(mapStateToProps, {
  updatePools,
  updateUserData,
  setRefetch,
  setLoading,
  setReCalculateExpired,
  getBalanceXIO,
  getBalanceALT,
  updateAllBalances,
  checkAllowance,
  clearUserData,
  updateOneDay,
  setPoolData,
  setPoolDataBalance,
  getQueryData,
  setStakeStatus,
})(Updater);
