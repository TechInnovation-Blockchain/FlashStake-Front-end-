import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import {
  loadContractData,
  checkContractState,
} from "../redux/actions/contractActions";
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
  loadContractData,
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
  checkContractState,
  baseInterestRate,
  updateWalletBalance,
  checkAllowanceXIO,
  checkAllowanceALT,
  getWalletBalance,
}) {
  const { loading, error, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    // console.log(data?.protocols);
  }, [data]);

  useEffect(() => {
    loadContractData();
    checkContractState();
  }, [loadContractData]);

  useEffect(() => {
    if (active && account) {
      refetch();
      getBalanceXIO();
      getBalanceALT();
      updateWalletBalance();
      checkAllowanceXIO();
      checkAllowanceALT();
    }
  }, [active, account, refetch, getBalanceXIO]);

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
      refetch();
      getBalanceXIO();
      getBalanceALT();
      checkAllowanceXIO();
      checkAllowanceALT();
      getWalletBalance();
      updateWalletBalance();
      setRefetch(false);
    }
  }, [refetchData, setRefetch, refetch, getBalanceXIO]);

  useEffect(() => {
    updatePools(data?.protocols[0]?.pools);
    updateUserData(data?.user);

    let reCalculateInterval = setInterval(() => {
      updateUserData(data?.user);
    }, 60000);
    return () => clearInterval(reCalculateInterval);
  }, [data]);

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
  loadContractData,
  userDataUpdate,
  updatePools,
  updateUserData,
  setRefetch,
  setLoading,
  setReCalculateExpired,
  getBalanceXIO,
  getBalanceALT,
  checkContractState,
  getWalletBalance,
  checkAllowanceXIO,
  checkAllowanceALT,
  updateWalletBalance,
})(Updater);
