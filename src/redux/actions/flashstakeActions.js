import Web3 from "web3";

import {
  initXioPublicFactoryContract,
  baseInterestRate,
} from "../../utils/contractFunctions/xioPublicFactoryContractFunctions";
import { initializePublicPortalContract } from "../../utils/contractFunctions/xioPublicPortalContractFunctions";
import {
  initializeErc20TokenContract,
  initializeErc20TokenInfuraContract,
  allowance,
  approve,
  balanceOf,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import {
  initializeTrade,
  getTokenAToWETHToTokenBPrice,
} from "../../utils/UniswapSdkFunctions";
import {
  stakeALT,
  initializeFlashstakeContract,
} from "../../utils/contractFunctions/xioFlashstakeContractFunctions";
import { setLoading } from "./uiActions";
import { CONSTANTS } from "../../utils/constants";
import { store } from "../../config/reduxStore";

export const checkAllowance = (_selectedPortal) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ allowance: true }));
  try {
    await initializeErc20TokenInfuraContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    const _allowance = await allowance(CONSTANTS.FLASHSTAKE_CONTRACT_ADDRESS);
    console.log("allowance -> ", _allowance);
    dispatch({
      type: "ALLOWANCE",
      payload: _allowance > 0,
    });
  } catch (e) {
    console.error("ERROR checkAllowance -> ", e);
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

export const getApproval = (_selectedPortal) => async (dispatch, getState) => {
  try {
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(CONSTANTS.FLASHSTAKE_CONTRACT_ADDRESS);
    dispatch(checkAllowance());
  } catch (e) {
    console.error("ERROR getApproval -> ", e);
  }
};

export const setSelectedStakeToken = (symbol, address) => async (
  dispatch,
  getState
) => {
  try {
    dispatch({
      type: "SELECTED_STAKE_TOKEN",
      payload: symbol,
    });
  } catch (e) {
    console.error("ERROR setSelectedStakeToken -> ", e);
  }
};

export const setSelectedRewardToken = (symbol, address) => async (
  dispatch,
  getState
) => {
  try {
    initializeTrade(CONSTANTS.ADDRESS_XIO_RINKEBY, address);
    dispatch({
      type: "SELECTED_REWARD_TOKEN",
      payload: symbol,
    });
    dispatch({
      type: "SELECTED_PORTAL",
      payload: address || "",
    });
  } catch (e) {
    console.error("ERROR setSelectedStakeToken -> ", e);
  }
};

export const calculateReward = (
  amountTokenA,
  days,
  reinitialize = false
) => async (dispatch, getState) => {
  let reward = 0;
  dispatch({
    type: "REWARD",
    payload: reward,
  });
  try {
    dispatch(setLoading({ reward: true }));
    if (amountTokenA > 0 && days > 0) {
      const {
        contract: { baseInterestRate },
        flashstake: { selectedPortal },
      } = await getState();
      let _reward;
      let _interest =
        amountTokenA * Web3.utils.fromWei(baseInterestRate) * days;
      const _executionPrice = await getTokenAToWETHToTokenBPrice(
        _interest,
        selectedPortal,
        reinitialize
      );
      _reward = _interest * _executionPrice;
      _reward = _reward - (_reward / 100) * 2;

      reward = _reward ? _reward.toFixed(18) : _reward;
    } else {
      reward = 0;
    }
  } catch (e) {
    reward = 0;
    console.error("ERROR calculateReward -> ", e);
  } finally {
    dispatch({
      type: "REWARD",
      payload: reward,
    });
    dispatch(setLoading({ reward: false }));
  }
};

export const getBalance = () => async (dispatch, getState) => {
  let balance = 0;
  try {
    const {
      web3: { active, account },
    } = getState();
    if (active && account) {
      await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
      balance = Web3.utils.fromWei(await balanceOf());
      console.log("balance -> ", balance);
    }
  } catch (e) {
    balance = 0;
    console.error("ERROR getBalance -> ", e);
  } finally {
    dispatch({
      type: "BALANCE",
      payload: balance,
    });
  }
};

export const stake = (quantity, days, restake) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ stake: true }));
  try {
    const {
      flashstake: {
        selectedPortal,
        reward,
        selectedStakeToken,
        selectedRewardToken,
      },
      user: { stakes },
    } = await getState();

    dispatch({
      type: "STAKE_REQUEST",
      payload: {
        quantity,
        days,
        reward,
        tokenA: selectedStakeToken,
        tokenB: selectedRewardToken,
      },
    });
    await initializeFlashstakeContract();
    // inputXIO, calculatedReward, rewardTokenAddress, expiredIDs, days
    console.log(
      "stakeAlt params -> ",
      Web3.utils.toWei(quantity.toString()),
      Web3.utils.toWei(reward.toString()),
      selectedPortal,
      restake
        ? stakes
            .filter(
              (_stake) =>
                parseFloat(_stake.initialTimestamp) +
                  parseFloat(_stake.endTimestamp) <
                  parseFloat(Date.now() / 1000) &&
                parseFloat(_stake.stakeAmount) > 0
            )
            .map((_stake) => _stake.id)
        : [],
      days
    );
    await stakeALT(
      Web3.utils.toWei(quantity.toString()),
      Web3.utils.toWei(reward.toString()),
      selectedPortal,
      restake
        ? stakes
            .filter(
              (_stake) =>
                parseFloat(_stake.initialTimestamp) +
                  parseFloat(_stake.endTimestamp) <
                  parseFloat(Date.now() / 1000) &&
                parseFloat(_stake.stakeAmount) > 0
            )
            .map((_stake) => _stake.id)
        : [],
      days
    );
  } catch (e) {
    console.error("ERROR stake -> ", e);
  }
  dispatch(setLoading({ stake: false }));
};

export const setInitialValues = (quantity, days) => {
  return {
    type: "INITIAL_VALUES",
    payload: {
      quantity,
      days,
    },
  };
};

export const setDialogStep = (step) => {
  return {
    type: "STAKE_DIALOG_STEP",
    payload: step,
  };
};

export const setDialogStepIndep = (step) => {
  store.dispatch(setDialogStep(step));
};

export const setReset = (val) => {
  return {
    type: "RESET",
    payload: val,
  };
};

export const setResetIndep = (val) => {
  store.dispatch(setReset(val));
};

export const setStakeTxnHash = (val) => {
  return {
    type: "STAKE_TXN_HASH",
    payload: val,
  };
};

export const setStakeTxnHashIndep = (val) => {
  store.dispatch(setStakeTxnHash(val));
};
