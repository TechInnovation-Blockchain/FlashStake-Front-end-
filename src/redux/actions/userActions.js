import { JSBI } from "@uniswap/sdk";
import Web3 from "web3";
// import { store } from "../../config/reduxStore";

export const userDataUpdate = (data) => async (dispatch, getState) => {
  const burnSingleStake = (quantity, _baseInterestRate, remainingDuration) => {
    return quantity * remainingDuration * _baseInterestRate;
  };

  const {
    contract: { baseInterestRate },
  } = getState();
  const _baseInterestRate = Web3.utils.fromWei(baseInterestRate);

  let _stakes = [];
  let currentStaked = {};
  try {
    _stakes = data?.user?.stakes ? data.user.stakes : [];
    if (data?.user?.stakes) {
      let totalStakeAmount = JSBI.BigInt(0);
      let availableStakeAmount = JSBI.BigInt(0);
      let expiredTimestamps = [];
      let timestamps = [];
      let earliest;
      let stakeAvailable;

      let stakes = data.user.stakes
        .filter((_stake) => parseFloat(_stake.stakeAmount) > 0)
        .map((_stake) => {
          let expired = false;
          let expiry =
            parseFloat(_stake.initialTimestamp) +
            parseFloat(_stake.endTimestamp);

          totalStakeAmount = JSBI.add(
            totalStakeAmount,
            JSBI.BigInt(_stake.stakeAmount)
          );

          if (expiry < parseFloat(Date.now() / 1000)) {
            availableStakeAmount = JSBI.add(
              availableStakeAmount,
              JSBI.BigInt(_stake.stakeAmount)
            );
            expired = true;
            expiredTimestamps.push(_stake.id);
          }

          let stakeAvailable =
            Web3.utils.fromWei(_stake.stakeAmount) -
            burnSingleStake(
              Web3.utils.fromWei(_stake.stakeAmount),
              _baseInterestRate,

              expiry > parseFloat(Date.now() / 1000)
                ? (expiry - parseFloat(Date.now() / 1000)) / 60
                : 0
            );

          timestamps.push(_stake.id);
          return {
            ..._stake,
            expired,
            expiry,
            stakeAmountConverted: Web3.utils.fromWei(_stake.stakeAmount),
            stakeAmountAvailable: expired
              ? Web3.utils.fromWei(_stake.stakeAmount)
              : "0",

            stakeAvailable,
            rewardEarned: Web3.utils.fromWei(
              data?.user?.stakeHistory.find(
                (_stakeHistory) => _stakeHistory.id === _stake.id
              )?.stakeReward || "0"
            ),
          };
        });

      earliest = Math.min(
        ...stakes
          .filter((_stake) => !_stake.expired)
          .map((_stake) => _stake.expiry)
      );

      currentStaked = {
        totalStakeAmount: Web3.utils.fromWei(totalStakeAmount.toString()),
        availableStakeAmount: Web3.utils.fromWei(
          availableStakeAmount.toString()
        ),
        lockedStakeAmount: Web3.utils.fromWei(
          JSBI.subtract(totalStakeAmount, availableStakeAmount).toString()
        ),
        expiredTimestamps,
        timestamps,
        stakes,

        earliest: earliest !== Infinity ? earliest : null,
      };
    }
  } catch (e) {
    _stakes = [];
    currentStaked = {};
    console.error("ERROR userDataUpdate -> ", e);
  }
  dispatch({
    type: "STAKES",
    payload: _stakes,
  });
  dispatch({
    type: "CURRENT_STAKED",
    payload: currentStaked,
  });
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
