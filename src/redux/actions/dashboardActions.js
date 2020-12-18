import { store } from "../../config/reduxStore";
import { setLoading } from "./uiActions";
import { JSBI } from "@uniswap/sdk";
import Web3 from "web3";
import React from "react";
import { utils } from "ethers";

import {
  initializeFlashstakeProtocolContract,
  unstakeALT,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import { _error } from "../../utils/log";

const {
  flashstake: { selectedRewardToken },
} = store.getState();

export const getDashboardProps = (data) => async (dispatch) => {
  let stakedPortals = [];
  try {
    if (data && data.user && data.user.stakes && data.publicPortals) {
      let uniquePortals = data.publicPortals.map((_portal) => {
        let totalStakeAmount = JSBI.BigInt(0);
        let availableStakeAmount = JSBI.BigInt(0);
        let expiredTimestamps = [];
        let timestamps = [];

        let uniquePortalStakes = data.user.stakes
          .filter(
            (_stake) =>
              _stake.publicPortal === _portal.id &&
              parseFloat(_stake.stakeAmount) > 0
          )
          .map((_stake) => {
            let expired = false;
            totalStakeAmount = JSBI.add(
              totalStakeAmount,
              JSBI.BigInt(_stake.stakeAmount)
            );
            if (
              parseFloat(_stake.initialTimestamp) +
                parseFloat(_stake.endTimestamp) <
              parseFloat(Date.now() / 1000)
            ) {
              availableStakeAmount = JSBI.add(
                availableStakeAmount,
                JSBI.BigInt(_stake.stakeAmount)
              );
              expired = true;
              expiredTimestamps.push(_stake.id);
            }
            timestamps.push(_stake.id);
            return { ..._stake, expired };
          });

        return {
          ..._portal,
          totalStakeAmount: utils.formatUnits(
            totalStakeAmount.toString(),
            selectedRewardToken?.tokenB?.decimal
          ),
          availableStakeAmount: utils.formatUnits(
            availableStakeAmount.toString(),
            selectedRewardToken?.tokenB?.decimal
          ),
          expiredTimestamps,
          timestamps,
          stakes: uniquePortalStakes,
        };
      });
      stakedPortals = uniquePortals.filter((_portal) => _portal.stakes.length);
    }
  } catch (e) {
    stakedPortals = [];
    _error("ERROR getDashboardProps -> ", e);
  }
  dispatch({
    type: "STAKED_PORTALS",
    payload: stakedPortals,
  });
  dispatch(setLoading({ dapp: false }));
};

const burnSingleStake = (quantity, _baseInterestRate, remainingDuration) => {
  return quantity * remainingDuration * _baseInterestRate;
};

export const calculateBurnStakes = (stakes) => {
  let burn = 0;
  const {
    contract: { baseInterestRate, oneDay },
  } = store.getState();
  const _baseInterestRate = utils.formatUnits(
    baseInterestRate.toString(),
    selectedRewardToken?.tokenB?.decimal
  );

  stakes
    .filter(
      (_stake) =>
        !_stake.expired && _stake.expireAfter > parseFloat(Date.now() / 1000)
    )
    .map((_stake) => {
      const remainingDuration =
        (parseFloat(_stake.expireAfter) - Math.ceil(Date.now() / 1000)) /
        oneDay;
      burn += burnSingleStake(
        utils.formatUnits(
          _stake.stakeAmount.toString(),
          selectedRewardToken?.tokenB?.decimal
        ),
        _baseInterestRate,
        remainingDuration > 0 ? remainingDuration : 0
      );
      return null;
    });
  return burn;
};

export const calculateBurn = (portal, getTimestamps, amount = Infinity) => {
  let burn = 0;
  const {
    contract: { baseInterestRate, oneDay },
  } = store.getState();
  const _baseInterestRate = utils.formatUnits(
    baseInterestRate.toString(),
    selectedRewardToken?.tokenB?.decimal
  );

  let remainingAmount =
    amount > parseFloat(portal.availableStakeAmount)
      ? parseFloat(amount) - parseFloat(portal.availableStakeAmount)
      : 0;
  let timestamps = [];

  if (portal?.stakes) {
    portal.stakes
      .filter((_stake) => !_stake.expired)
      .map((_stake) => {
        const remainingDuration =
          (parseFloat(_stake.initialTimestamp) +
            parseFloat(_stake.endTimestamp) -
            Math.ceil(Date.now() / 1000)) /
          oneDay;

        if (remainingAmount > parseFloat(_stake.stakeAmountConverted)) {
          remainingAmount -= parseFloat(_stake.stakeAmountConverted);
        } else if (remainingAmount) {
          remainingAmount = 0;
        } else {
          return null;
        }
        timestamps.push(_stake.id);
        burn += burnSingleStake(
          utils.formatUnits(
            _stake.stakeAmount.toString(),
            selectedRewardToken?.tokenB?.decimal
          ),
          _baseInterestRate,
          remainingDuration > 0 ? remainingDuration : 0
        );
        return null;
      });
  }
  return getTimestamps ? timestamps : burn.toFixed(18);
};

export const withdrawSpecificStakes = (stakes, _amount) => async (dispatch) => {
  try {
    let amount = JSBI.BigInt(0);
    const timestamps = stakes.map((_stake) => {
      amount = JSBI.add(amount, JSBI.BigInt(_stake.stakeAmount));
      return _stake.id;
    });
    dispatch({
      type: "WITHDRAW_REQUEST",
      payload: {
        quantity: _amount
          ? _amount
          : utils.formatUnits(
              amount.toString(),
              selectedRewardToken?.tokenB?.decimal
            ),
        symbol: "FLASH",
      },
    });
    await initializeFlashstakeProtocolContract();
    await unstakeALT(timestamps, amount.toString());
  } catch (e) {
    _error("ERROR withdrawSpecificStakes -> ", e);
  }
};

export const withdraw = (portal, type, amount) => async (dispatch) => {
  try {
    dispatch({
      type: "WITHDRAW_REQUEST",
      payload: {
        quantity:
          type === "available"
            ? portal.availableStakeAmount
            : type === "max"
            ? portal.totalStakeAmount - calculateBurn(portal)
            : amount - calculateBurn(portal, false, amount),
        symbol: "FLASH",
      },
    });
    await initializeFlashstakeProtocolContract();

    await unstakeALT(
      ...(type === "available"
        ? [
            portal.expiredTimestamps,

            utils.parseUnits(
              portal.availableStakeAmount.toString(),
              selectedRewardToken?.tokenB?.decimal
            ),
          ]
        : type === "max"
        ? [
            portal.timestamps,
            utils.parseUnits(
              portal.totalStakeAmount.toString(),
              selectedRewardToken?.tokenB?.decimal
            ),
          ]
        : [
            [
              ...portal.expiredTimestamps,
              ...calculateBurn(portal, true, amount),
            ],
            utils.parseUnits(
              amount.toString(),
              selectedRewardToken?.tokenB?.decimal
            ),
          ])
    );
  } catch (e) {
    _error("ERROR withdraw -> ", e);
  }
};

export const setDialogStep = (step) => {
  return {
    type: "DASHBOARD_DIALOG_STEP",
    payload: step,
  };
};

export const setDialogStepIndep = (step) => {
  store.dispatch({
    type: "DASHBOARD_DIALOG_STEP",
    payload: step,
  });
};

export const setRefetch = (val) => {
  return {
    type: "REFETCH",
    payload: val,
  };
};

export const setReCalculateExpired = (val) => {
  return {
    type: "RECALCULATE",
    payload: val,
  };
};

export const setRefetchIndep = (val) => {
  store.dispatch(setRefetch(val));
};

export const setWithdrawTxnHash = (val) => {
  return {
    type: "WITHDRAW_TXN_HASH",
    payload: val,
  };
};

export const setWithdrawTxnHashIndep = (val) => {
  store.dispatch(setWithdrawTxnHash(val));
};

export const toggleAccordianExpanded = (val) => {
  return {
    type: "TOGGLE_ACCORDIAN_EXPANDED",
  };
};

// export const selectStake = (id) => async (dispatch, getState) => {
//   try {
//     const {
//       user: { stakes },
//       dashboard: { selectedStakes },
//       ui: { falseSelected },
//     } = await getState();

//     if (Object.keys(selectedStakes).length === 0) {
//       dispatch({
//         type: "SELECT_STAKE",
//         payload: id,
//       });
//     } else {
//       const exp = stakes?.filter((stake) => stake.id === id);
//       if (!exp[0].expired) {
//         if (exp[0].id !== id) {
//           dispatch({
//             type: "CLEAR_SELECTION",
//             payload: {},
//           });
//         }
//         dispatch({
//           type: "SELECT_STAKE",
//           payload: id,
//         });
//         dispatch({
//           type: "FALSE_SELECTION",
//           payload: false,
//         });
//         // setFalseSelected(false);
//       }
//       if (exp[0].expired) {
//         const exp2 = stakes?.filter((stake) => id === stake.id);
//         if (exp2[0].expired && !falseSelected) {
//           dispatch({
//             type: "CLEAR_SELECTION",
//             payload: {},
//           });
//         }
//         dispatch({
//           type: "FALSE_SELECTION",
//           payload: true,
//         });
//         dispatch({
//           type: "SELECT_STAKE",
//           payload: id,
//         });
//       }
//     }

//     const {
//       user: { stakes: Stakes },
//       dashboard: { selectedStakes: SelectedStakes },
//     } = await getState();

//     const _SelectedStakes = Stakes.filter((stake) => SelectedStakes[stake.id]);
//     let totalBurn = 0;
//     let totalXIO = 0;

//     _SelectedStakes.map((_stake) => {
//       totalBurn += parseFloat(_stake.burnAmount) || 0;
//       totalXIO += parseFloat(_stake.stakeAmount) || 0;
//     });

//     dispatch({
//       type: "SUM_OF_BURN",
//       payload: {
//         totalBurn,
//         totalXIO,
//       },
//     });
//   } catch (e) {
//     _error("ERROR  -> ", e);
//     // setDialogStepIndep("failedStake");
//     // showSnackbarIndep("Stake Transaction Failed.", "error");
//   }
// };

export const selectStake = (id) => async (dispatch, getState) => {
  try {
    const {
      user: { stakes },
      dashboard: { selectedStakes },
    } = await getState();

    const _currentStake = stakes.find((stake) => stake.id === id);
    const _ids = Object.keys(selectedStakes).filter(
      (_key) => selectedStakes[_key]
    );

    const _firstStake = stakes.find((_stake) => _stake.id === _ids[0]);
    if (
      _firstStake &&
      ((!_firstStake.expired && _firstStake.id !== id) ||
        (!_firstStake.expired && _currentStake.expired) ||
        (_firstStake.expired && !_currentStake.expired))
    ) {
      dispatch({
        type: "CLEAR_SELECTION",
      });
    }

    dispatch({
      type: "SELECT_STAKE",
      payload: id,
    });

    const {
      user: { stakes: Stakes },
      dashboard: { selectedStakes: SelectedStakes },
    } = await getState();

    const _SelectedStakes = Stakes.filter((stake) => SelectedStakes[stake.id]);
    let totalBurn = 0;
    let totalXIO = 0;

    _SelectedStakes.map((_stake) => {
      totalBurn += parseFloat(_stake.burnAmount) || 0;
      totalXIO += parseFloat(_stake.stakeAmount) || 0;
    });

    dispatch({
      type: "SUM_OF_BURN",
      payload: {
        totalBurn,
        totalXIO,
      },
    });
  } catch (e) {
    _error("ERROR  -> ", e);
  }
};

export const clearSelection = () => {
  return {
    type: "CLEAR_SELECTION",
  };
};

export const setStakeStatus = (data) => {
  return {
    type: "STAKE_STATUS",
    payload: data,
  };
};
