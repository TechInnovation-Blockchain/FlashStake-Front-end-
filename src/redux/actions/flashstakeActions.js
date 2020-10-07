import Web3 from "web3";
import { store } from "../../config/reduxStore";
import {
  initializeErc20TokenContract,
  initializeErc20TokenInfuraContract,
  allowance,
  approve,
  balanceOf,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import {
  initializeFlashstakeProtocolContract,
  stake,
  unstake,
  calculateXPY,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import {
  initializeFlashstakePoolContract,
  getAPYStake,
  getAPYSwap,
} from "../../utils/contractFunctions/flashstakePoolContractFunctions";
import { setLoading } from "./uiActions";
import { CONSTANTS } from "../../utils/constants";
import { swap } from "../../utils/contractFunctions/FlashStakeProtocolContract";
import { JSBI } from "@uniswap/sdk";

export const calculateReward = (xioQuantity, days) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ reward: true }));
  let reward = "0";
  try {
    const {
      flashstake: {
        selectedRewardToken: { id },
      },
    } = getState();
    if (id && xioQuantity > 0 && days > 0) {
      initializeFlashstakeProtocolContract();
      initializeFlashstakePoolContract(id);
      let _amountIn = await calculateXPY(Web3.utils.toWei(xioQuantity), days);
      reward = await getAPYStake(_amountIn);
      console.log({ _amountIn, reward });
    }
  } catch (e) {
    console.error("ERROR calculateReward -> ", e);
  }
  dispatch({
    type: "STAKE_REWARD",
    payload: reward,
  });
  dispatch(setLoading({ reward: false }));
};

export const calculateSwap = (altQuantity) => async (dispatch, getState) => {
  let swapAmount = "0";
  try {
    const {
      flashstake: {
        selectedRewardToken: { id },
      },
    } = getState();
    if (id && altQuantity > 0) {
      initializeFlashstakePoolContract(id);
      swapAmount = await getAPYSwap(Web3.utils.toWei(altQuantity));
      console.log({ swapAmount });
    }
  } catch (e) {
    console.error("ERROR calculateSwap -> ", e);
  }
  dispatch({
    type: "SWAP_OUTPUT",
    payload: Web3.utils.fromWei(swapAmount),
  });
};

export const checkAllowanceXIO = () => async (dispatch, getState) => {
  dispatch(setLoading({ allowance: true }));
  try {
    await initializeErc20TokenInfuraContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    const _allowance = await allowance(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
    );
    // console.log("allowance -> ", _allowance);
    dispatch({
      type: "ALLOWANCE_XIO",
      payload: _allowance > 0,
    });
  } catch (e) {
    console.error("ERROR checkAllowance -> ", e);
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

export const checkAllowanceALT = () => async (dispatch, getState) => {
  dispatch(setLoading({ allowance: true }));
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    await initializeErc20TokenInfuraContract(selectedRewardToken.tokenB.id);
    const _allowance = await allowance(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
    );
    console.log({ allowanceALT: _allowance });
    dispatch({
      type: "ALLOWANCE_ALT",
      payload: _allowance > 0,
    });
  } catch (e) {
    console.error("ERROR checkAllowance -> ", e);
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

export const getApprovalXIO = () => async (dispatch, getState) => {
  try {
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS);
    dispatch(checkAllowanceXIO());
  } catch (e) {
    console.error("ERROR getApprovalXIO -> ", e);
  }
};

export const getApprovalALT = (_selectedPortal) => async (
  dispatch,
  getState
) => {
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    await initializeErc20TokenContract(selectedRewardToken.tokenB.id);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS);
    dispatch(checkAllowanceALT());
  } catch (e) {
    console.error("ERROR getApprovalALT -> ", e);
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

export const setSelectedRewardToken = (_pool) => async (dispatch, getState) => {
  try {
    // initializeTrade(CONSTANTS.ADDRESS_XIO_RINKEBY, address);
    dispatch({
      type: "SELECTED_REWARD_TOKEN",
      payload: _pool,
    });
    dispatch({
      type: "SELECTED_PORTAL",
      payload: _pool.id || "",
    });
  } catch (e) {
    console.error("ERROR setSelectedStakeToken -> ", e);
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
      // console.log("balance -> ", balance);
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

export const stakeXIO = (xioQuantity, days) => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedRewardToken, reward },
    } = await getState();
    if (!selectedRewardToken?.tokenB?.id) {
      throw new Error("No reward token found!");
    }
    // let _rewardAfterSlippage = JSBI.subtract(
    //   JSBI.BigInt(reward),
    //   JSBI.multiply(
    //     JSBI.divide(JSBI.BigInt(reward), JSBI.BigInt(100)),
    //     JSBI.BigInt(5)
    //   )
    // ).toString();
    dispatch({
      type: "STAKE_REQUEST",
      payload: {
        token: selectedRewardToken.tokenB.symbol,
        quantity: xioQuantity,
        days,
        reward: Web3.utils.fromWei(reward),
      },
    });
    initializeFlashstakeProtocolContract();
    console.log(
      "stakeXIO params -> ",
      selectedRewardToken.tokenB.id,
      Web3.utils.toWei(xioQuantity),
      days,
      reward
    );
    await stake(
      selectedRewardToken.tokenB.id,
      Web3.utils.toWei(xioQuantity),
      days,
      // _rewardAfterSlippage
      0
    );
  } catch (e) {
    console.error("ERROR stakeXIO -> ", e);
  }
};

export const unstakeXIO = () => async (dispatch, getState) => {
  try {
    const {
      user: { dappBalance, expiredTimestamps },
    } = await getState();
    if (
      dappBalance <= 0 ||
      !expiredTimestamps ||
      expiredTimestamps?.length <= 0
    ) {
      throw new Error("No stake to withdraw!");
    }
    dispatch({
      type: "UNSTAKE_REQUEST",
      payload: {
        timestamps: expiredTimestamps,
        quantity: dappBalance,
      },
    });
    initializeFlashstakeProtocolContract();
    console.log(
      "unstakeXIO params -> ",
      expiredTimestamps,
      Web3.utils.fromWei(dappBalance)
    );
    await unstake(expiredTimestamps, Web3.utils.toWei(dappBalance));
  } catch (e) {
    console.error("ERROR unstakeXIO -> ", e);
  }
};

// function swap(uint256 _altQuantity, address _token)
export const swapALT = (_altQuantity) => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedRewardToken },
    } = await getState();
    if (_altQuantity > 0 && selectedRewardToken?.id) {
      dispatch({
        type: "SWAP_REQUEST",
        payload: {
          timestamps: _altQuantity,
          token: selectedRewardToken.tokenB,
        },
      });
      initializeFlashstakeProtocolContract();
      console.log(
        "swapALT params -> ",
        _altQuantity,
        selectedRewardToken.tokenB.id
      );
      await swap(Web3.utils.toWei(_altQuantity), selectedRewardToken.tokenB.id);
    }
  } catch (e) {
    console.error("ERROR swapALT -> ", e);
  }
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
