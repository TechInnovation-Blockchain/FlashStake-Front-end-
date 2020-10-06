import { JSBI } from "@uniswap/sdk";
import Web3 from "web3";
import {
  initializeErc20TokenContract,
  balanceOf,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import { CONSTANTS } from "../../utils/constants";
// import { store } from "../../config/reduxStore";

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
  dispatch({
    type: "POOL",
    payload: data,
  });
};

export const updateUserData = (data) => async (dispatch) => {
  let stakes;
  let expiredTimestamps = [];
  let dappBalance = JSBI.BigInt(0);
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
      if (expired) {
        dappBalance = JSBI.add(dappBalance, JSBI.BigInt(stakeAmount));
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
    dispatch({
      type: "USER_DATA",
      payload: {
        ...data,
        expiredTimestamps,
        stakes,
        dappBalance: Web3.utils.fromWei(dappBalance.toString()),
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
