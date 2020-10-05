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
import { userDataUpdate, updatePools } from "../redux/actions/userActions";
import { userStakesQuery } from "../graphql/queries/userStakesQuery";
import { getBalance } from "../redux/actions/flashstakeActions";

function Updater({
  loadContractData,
  active,
  account,
  chainId,
  userDataUpdate,
  updatePools,
  refetchData,
  setRefetch,
  setLoading,
  portals,
  currentStaked,
  reCalculateExpired,
  setReCalculateExpired,
  getBalance,
  checkContractState,
  baseInterestRate,
}) {
  const { loading, error, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
  });

  useEffect(() => {
    console.log(data?.protocols);
  }, [data]);

  useEffect(() => {
    loadContractData();
    checkContractState();
  }, [loadContractData]);

  useEffect(() => {
    if (active && account) {
      refetch();
      getBalance();
    }
  }, [active, account, refetch, getBalance]);

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
      getBalance();
      setRefetch(false);
    }
  }, [refetchData, setRefetch, refetch, getBalance]);

  // useEffect(() => {
  //   updatePools(data?.protocols[0].pools);
  // }, [data]);

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
  setRefetch,
  setLoading,
  setReCalculateExpired,
  getBalance,
  checkContractState,
})(Updater);
