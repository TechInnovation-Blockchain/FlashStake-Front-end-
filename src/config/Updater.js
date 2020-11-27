import { useEffect } from "react";
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
// import { getPoolBalances } from "../utils/contractFunctions/balanceContractFunctions";

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
  walletBalancesPool,
}) {
  const { loading, data, refetch } = useQuery(userStakesQuery, {
    variables: {
      account: account ? account.toString().toLowerCase() : "",
    },
    fetchPolicy: "network-only",
  });

  // const {
  //   user: { poolDataBalance },
  // } = store.getState();

  // useEffect(() => {
  //   getPoolBalances();
  // }, [active, account, pools]);

  // useEffect(() => {
  //   reserves();
  // }, []);

  // const [poolDATA, setPoolDATA] = useState([]);
  // const reserves = useCallback(async () => {
  //   const data1 = await axios.get("https://server.xio.app:3010/getReserves");
  //   // console.log(data.data["0x2ab334fe1563ef439f28e78db4d606a71db202e9"]);
  //   let POOLDATA = {};
  //   if (data1) {
  //     Object.keys(poolDataBalance).map((key) => {
  //       if (poolDataBalance[key] > 0) {
  //         POOLDATA[key] = {
  //           totalSupply: data1.data[key].poolTotalSupply,
  //           poolBalance: poolDataBalance[key],
  //           share: poolDataBalance[key] / data1.data[key].poolTotalSupply,
  //           pooledFlash:
  //             (poolDataBalance[key] / data1.data[key].poolTotalSupply) *
  //             data1.data[key].reserveFlashAmount,
  //           pooledAlt:
  //             (poolDataBalance[key] / data1.data[key].poolTotalSupply) *
  //             data1.data[key].reserveAltAmount,
  //           // symbol: Object.keys(poolItems)[key],
  //         };
  //       }
  //     });
  //   }
  //   setPoolData(POOLDATA);
  //   // console.log(
  //   //   "PoolDATA",
  //   //   Object.keys(poolData).map((id) => {
  //   //     console.log(poolData[id]);
  //   //   })
  //   // );
  // }, [poolDataBalance]);

  // const ts = async (key) => {
  //   for (let index = 0; index < Object.keys(poolDataBalance); index++) {
  //     await setTotalSupply(key);
  //   }

  //   // Object.keys(poolDataBalance).map((key) => {

  //   // });
  // };

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
  poolDataBalance,
  pools,
  poolItems,
  walletBalancesPool,
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
  // getPoolBalances,
})(Updater);
