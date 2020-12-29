import { useEffect } from "react";
import { connect } from "react-redux";
import { useQuery } from "@apollo/client";

import { setLoading } from "../redux/actions/uiActions";
import { updateTokenList } from "../redux/actions/contractActions";

import {
  setRefetch,
  setReCalculateExpired,
  setStakeStatus,
  setRefetchProtocols,
} from "../redux/actions/dashboardActions";
import {
  updatePools,
  updateUserData,
  clearUserData,
  updateAllBalances,
  setPoolData,
  setPoolDataBalance,
} from "../redux/actions/userActions";
import {
  userStakesQuery,
  protocolsQuery,
} from "../graphql/queries/userStakesQuery";
import {
  getBalanceXIO,
  getBalanceALT,
  checkAllowance,
} from "../redux/actions/flashstakeActions";
import { analytics } from "./App";
import { updateOneDay } from "../redux/actions/contractActions";
import { getQueryData, getAllQueryData } from "../redux/actions/queryActions";
import { fetchTokenList } from "../utils/utilFunc";
import { CONSTANTS } from "../utils/constants";
// import { getPoolBalances } from "../utils/contractFunctions/balanceContractFunctions";

function Updater({
  active,
  account,
  chainId,
  updatePools,
  updateUserData,
  refetchData,
  refetchPools,
  setRefetch,
  setRefetchProtocols,
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
  walletBalancesPool,
  tokensURI,
  pools,
  updateTokenList,
  tokenList,
  allPoolsData,
}) {
  const { loading, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  const {
    loading: loadingProtocol,
    data: dataProtocols,
    refetch: refetchProtocols,
  } = useQuery(protocolsQuery, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    updateOneDay();
  }, []);

  const getTokensList = async () => {
    const data = await fetchTokenList(tokensURI?.uri);
    if (data?.data?.tokens && pools) {
      let userTokens;
      try {
        userTokens = JSON.parse(await localStorage.getItem("tokenList"));
      } catch (e) {}

      console.log(
        "HERE----->",
        [...(data?.data?.tokens || []), ...(userTokens || [])].filter(
          (_item) =>
            // !_item.chainId ||
            // _item.chainId === CONSTANTS.CHAIN_ID ||

            allPoolsData[_item.address]
        )
        // allPoolsData[]
      );

      updateTokenList(
        [...(data?.data?.tokens || []), ...(userTokens || [])].filter(
          (_item) => !_item.chainId || _item.chainId === CONSTANTS.CHAIN_ID
          // pools.filter((_pool) => _pool.tokenB.id !== _item.address)
          // !allPoolsData[_item.address]
        )
      );
    }
  };

  useEffect(() => {
    getTokensList();
  }, [tokensURI, pools]);

  useEffect(() => {
    updateAllBalances();
  }, [tokenList]);

  useEffect(() => {
    if (active && account) {
      analytics.setUserId(account);
      analytics.logEvent("USER_WALLET_ACTIVATED", {
        address: `Address -> ${account}`,
      });
      refetch();
      const _interval = window.setInterval(() => {
        updateAllBalances();
        getAllQueryData();
      }, 60000);
      getAllQueryData();
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
    if (refetchPools) {
      refetchProtocols();
      setRefetchProtocols(false);
    }
  }, [refetchPools]);

  useEffect(() => {
    updatePools(dataProtocols?.protocols[0]?.pools);
  }, [dataProtocols]);

  useEffect(() => {
    updateUserData(data?.user);

    let reCalculateInterval = setInterval(() => {
      updateUserData(data?.user);
    }, 60000);
    return () => clearInterval(reCalculateInterval);
  }, [data, updateUserData, oneDay]);

  return null;
}

const mapStateToProps = ({
  web3: { active, account, chainId },
  dashboard: {
    refetch,
    refetchProtocols,
    reCalculateExpired,
    stakeStatus,
    isStakesSelected,
    selectedStakes,
  },
  user: {
    currentStaked,
    poolData,
    poolDataBalance,
    pools,
    poolItems,
    walletBalancesPool,
  },
  query: { allPoolsData },
  ui: { tokensURI },
  flashstake: { selectedPortal },
  contract: { oneDay, tokenList },
}) => ({
  active,
  account,
  chainId,
  refetchData: refetch,
  refetchPools: refetchProtocols,
  currentStaked,
  reCalculateExpired,
  selectedPortal,
  oneDay,
  poolData,
  stakeStatus,
  isStakesSelected,
  selectedStakes,
  poolDataBalance,
  pools,
  poolItems,
  walletBalancesPool,
  allPoolsData,
  tokensURI,
  tokenList,
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
  setRefetchProtocols,
  // getPoolBalances,
  updateTokenList,
})(Updater);
