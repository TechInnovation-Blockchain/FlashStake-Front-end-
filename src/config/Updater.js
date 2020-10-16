import { useEffect } from "react";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import { setLoading } from "../redux/actions/uiActions";
import {
  setRefetch,
  setReCalculateExpired,
} from "../redux/actions/dashboardActions";
import {
  updatePools,
  updateUserData,
  clearUserData,
  updateAllBalances,
} from "../redux/actions/userActions";
import { userStakesQuery } from "../graphql/queries/userStakesQuery";
import {
  getBalanceXIO,
  checkAllowanceXIO,
  getBalanceALT,
  checkAllowanceALT,
} from "../redux/actions/flashstakeActions";
import { analytics } from "./App";

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
  checkAllowanceXIO,
  checkAllowanceALT,
  clearUserData,
}) {
  const { loading, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (active && account) {
      analytics.setUserId(account);
      analytics.logEvent("USER_WALLET_ACTIVATED", {
        address: `Address -> ${account}`,
      });
      refetch();
      const _interval = window.setInterval(() => {
        updateAllBalances();
      }, 30000);
      getBalanceALT();
      checkAllowanceXIO();
      checkAllowanceALT();
      return () => window.clearInterval(_interval);
    } else {
      clearUserData();
    }
  }, [active, account]);

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
      checkAllowanceXIO();
      checkAllowanceALT();
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
  }, [data, updatePools, updateUserData]);

  return null;
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  dashboard: { refetch, reCalculateExpired },
  user: { currentStaked },
}) => ({
  active,
  account,
  chainId,
  refetchData: refetch,
  currentStaked,
  reCalculateExpired,
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
  checkAllowanceXIO,
  checkAllowanceALT,
  clearUserData,
})(Updater);
