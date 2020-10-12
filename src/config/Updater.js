import { useEffect } from "react";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import { setLoading } from "../redux/actions/uiActions";
import {
  setRefetch,
  setReCalculateExpired,
} from "../redux/actions/dashboardActions";
import {
  userDataUpdate,
  updatePools,
  updateUserData,
  updateWalletBalance,
} from "../redux/actions/userActions";
import { userStakesQuery } from "../graphql/queries/userStakesQuery";
import {
  getBalanceXIO,
  checkAllowanceXIO,
  getBalanceALT,
  checkAllowanceALT,
  getWalletBalance,
} from "../redux/actions/flashstakeActions";

function Updater({
  active,
  account,
  chainId,
  userDataUpdate,
  updatePools,
  updateUserData,
  refetchData,
  setRefetch,
  setLoading,
  portals,
  currentStaked,
  reCalculateExpired,
  setReCalculateExpired,
  getBalanceXIO,
  getBalanceALT,
  baseInterestRate,
  updateWalletBalance,
  checkAllowanceXIO,
  checkAllowanceALT,
  getWalletBalance,
}) {
  const { loading, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (active && account) {
      console.log("active account");
      refetch();
      getBalanceXIO();
      getBalanceALT();
      const _interval = setInterval(updateWalletBalance(), 3000);
      checkAllowanceXIO();
      checkAllowanceALT();
      return clearInterval(_interval);
    }
  }, [
    active,
    account,
    refetch,
    getBalanceXIO,
    checkAllowanceALT,
    checkAllowanceXIO,
    getBalanceALT,
    updateWalletBalance,
  ]);

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
      userDataUpdate(data);
    }
    setReCalculateExpired(false);
  }, [reCalculateExpired, data, userDataUpdate, setReCalculateExpired]);

  useEffect(() => {
    setLoading({ data: loading });
    if (!loading && data) {
      userDataUpdate(data);
    }
  }, [loading, data, setLoading, userDataUpdate, baseInterestRate]);

  useEffect(() => {
    if (refetchData) {
      console.log("refetchData");
      refetch();
      getBalanceXIO();
      getBalanceALT();
      checkAllowanceXIO();
      checkAllowanceALT();
      getWalletBalance();
      updateWalletBalance();
      setRefetch(false);
    }
  }, [
    refetchData,
    setRefetch,
    refetch,
    getBalanceXIO,
    checkAllowanceALT,
    checkAllowanceXIO,
    getBalanceALT,
    getWalletBalance,
    updateWalletBalance,
  ]);
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
  contract: { portals, baseInterestRate },
  dashboard: { refetch, reCalculateExpired },
  user: { currentStaked },
}) => ({
  active,
  account,
  chainId,
  refetchData: refetch,
  portals,
  currentStaked,
  reCalculateExpired,
  baseInterestRate,
});

export default connect(mapStateToProps, {
  userDataUpdate,
  updatePools,
  updateUserData,
  setRefetch,
  setLoading,
  setReCalculateExpired,
  getBalanceXIO,
  getBalanceALT,
  getWalletBalance,
  checkAllowanceXIO,
  checkAllowanceALT,
  updateWalletBalance,
})(Updater);
