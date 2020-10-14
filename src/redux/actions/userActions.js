import { JSBI } from "@uniswap/sdk";
import axios from "axios";
import Web3 from "web3";
import {
  initializeErc20TokenContract,
  balanceOf,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import { CONSTANTS } from "../../utils/constants";
// import { store } from "../../config/reduxStore";
import { getWalletBalance } from "../../redux/actions/flashstakeActions";
import { setLoading } from "./uiActions";

export const userDataUpdate = (data) => async (dispatch, getState) => {};

export const updateWalletBalance = (data) => async (dispatch, getState) => {
  try {
    initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    let walletBalance = await balanceOf();
    dispatch({
      type: "WALLET_BALANCE",
      payload: Web3.utils.fromWei(walletBalance),
    });
  } catch (e) {
    console.error("ERROR updateWalletBalance -> ", e);
  }
};

export const updatePools = (data) => async (dispatch) => {
  let _pools = [];
  try {
    if (data?.length) {
      dispatch(setLoading({ dapp: false }));
      _pools = JSON.parse(JSON.stringify(data));
      for (let i = 0; i < _pools.length; i++) {
        try {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${
              CONSTANTS.MAINNET_ADDRESSES[_pools[i].tokenB.symbol]
            }&vs_currencies=USD`
            // `https://min-api.cryptocompare.com/data/price?fsym=${_pools[i].tokenB.symbol}&tsyms=USD`
          );
          _pools[i].tokenPrice = Object.values(response.data)[0].usd || 0;
        } catch (e) {
          console.error("ERROR pricingAPI -> ", e);
        }
      }
    }
  } catch (e) {
    console.error("ERROR updatePools -> ", e);
  } finally {
    dispatch({
      type: "POOL",
      payload: _pools,
    });
    dispatch(getWalletBalance());
  }
};

export const updateUserData = (data) => async (dispatch) => {
  let stakes;
  let swapHistory;
  let expiredTimestamps = [];
  let dappBalance = JSBI.BigInt(0);
  let expiredDappBalance = JSBI.BigInt(0);
  if (data) {
    stakes = data.stakes.map((_tempData) => {
      const {
        id,
        initiationTimestamp,
        expiredTimestamp,
        stakeAmount,
        rewardAmount,
      } = _tempData;
      let expiryTime =
        parseFloat(initiationTimestamp) + parseFloat(expiredTimestamp);
      let expired = expiryTime < Date.now() / 1000;
      dappBalance = JSBI.add(dappBalance, JSBI.BigInt(stakeAmount));
      if (expired) {
        expiredDappBalance = JSBI.add(
          expiredDappBalance,
          JSBI.BigInt(stakeAmount)
        );
        expiredTimestamps.push(id);
      }
      return {
        ..._tempData,
        stakeAmount: Web3.utils.fromWei(stakeAmount),
        rewardAmount: Web3.utils.fromWei(rewardAmount),
        expiryTime,
        expired,
        amountAvailable: expired
          ? Web3.utils.fromWei(_tempData.stakeAmount)
          : "0",
      };
    });
    swapHistory = data.swapHistory.map((_swapHis) => ({
      ..._swapHis,
      swapAmount: Web3.utils.fromWei(_swapHis.swapAmount),
      xioReceived: Web3.utils.fromWei(_swapHis.xioReceived),
    }));
    dispatch({
      type: "USER_DATA",
      payload: {
        ...data,
        expiredTimestamps,
        stakes,
        dappBalance: Web3.utils.fromWei(dappBalance.toString()),
        swapHistory,
        expiredDappBalance: Web3.utils.fromWei(expiredDappBalance.toString()),
      },
    });
  } else {
    dispatch({
      type: "USER_DATA",
      payload: {
        swapHistory: [],
        stakes: [],
      },
    });
  }
};

// export const getDashboardProps = (data) => async (dispatch) => {
//   let stakedPortals = [];
//   try {
//     if (data && data.user && data.user.stakes && data.publicPortals) {
//       let uniquePortals = data.publicPortals.map((_portal) => {
//         let totalStakeAmount = JSBI.BigInt(0);
//         let availableStakeAmount = JSBI.BigInt(0);
//         let expiredTimestamps = [];
//         let timestamps = [];

//         let uniquePortalStakes = data.user.stakes
//           .filter(
//             (_stake) =>
//               _stake.publicPortal === _portal.id &&
//               parseFloat(_stake.stakeAmount) > 0
//           )
//           .map((_stake) => {
//             let expired = false;
//             totalStakeAmount = JSBI.add(
//               totalStakeAmount,
//               JSBI.BigInt(_stake.stakeAmount)
//             );
//             if (
//               parseFloat(_stake.initialTimestamp) +
//                 parseFloat(_stake.endTimestamp) <
//               parseFloat(Date.now() / 1000)
//             ) {
//               availableStakeAmount = JSBI.add(
//                 availableStakeAmount,
//                 JSBI.BigInt(_stake.stakeAmount)
//               );
//               expired = true;
//               expiredTimestamps.push(_stake.id);
//             }
//             timestamps.push(_stake.id);
//             return { ..._stake, expired };
//           });

//         return {
//           ..._portal,
//           totalStakeAmount: Web3.utils.fromWei(totalStakeAmount.toString()),
//           availableStakeAmount: Web3.utils.fromWei(
//             availableStakeAmount.toString()
//           ),
//           expiredTimestamps,
//           timestamps,
//           stakes: uniquePortalStakes,
//         };
//       });
//       stakedPortals = uniquePortals.filter((_portal) => _portal.stakes.length);
//     }
//   } catch (e) {
//     stakedPortals = [];
//     console.error("ERROR getDashboardProps -> ", e);
//   }
//   dispatch({
//     type: "STAKED_PORTALS",
//     payload: stakedPortals,
//   });
//   dispatch(setLoading({ dapp: false }));
// };
