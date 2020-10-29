import Web3 from "web3";
import { store } from "../../config/reduxStore";
import _ from "lodash";
import {
  initializeErc20TokenContract,
  initializeErc20TokenInfuraContract,
  allowance,
  approve,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import {
  initializeFlashstakeProtocolContract,
  stake,
  unstake,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import {
  initializeFlashstakePoolContract,
  getAPYSwap,
} from "../../utils/contractFunctions/flashstakePoolContractFunctions";
import { setLoading, setLoadingIndep, showSnackbarIndep } from "./uiActions";
import { getQueryData } from "./queryActions";
import { CONSTANTS } from "../../utils/constants";
import { swap } from "../../utils/contractFunctions/FlashStakeProtocolContract";
import { JSBI } from "@uniswap/sdk";
import { _log, _error } from "../../utils/log";

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
      const data = await getQueryData(id);
      const _precision = JSBI.BigInt(Web3.utils.toWei("1"));
      const _quantity = JSBI.BigInt(Web3.utils.toWei(xioQuantity));
      const _annualRate = JSBI.divide(
        JSBI.multiply(JSBI.BigInt(data.totalSupply), _precision),
        JSBI.add(JSBI.BigInt(data.xioBalance), _quantity)
      );
      const _xpy = JSBI.greaterThan(
        _annualRate,
        JSBI.BigInt(Web3.utils.toWei("50"))
      )
        ? JSBI.BigInt(Web3.utils.toWei("50"))
        : _annualRate;
      const _calculateXpyTemp = JSBI.divide(
        JSBI.multiply(JSBI.multiply(_quantity, JSBI.BigInt(days)), _xpy),
        JSBI.multiply(_precision, JSBI.BigInt("36500"))
      );
      const _limit = JSBI.divide(_quantity, JSBI.BigInt("2"));
      const _calculateXpy = JSBI.greaterThan(_calculateXpyTemp, _limit)
        ? _limit
        : _calculateXpyTemp;

      const _reward = JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(_calculateXpy, JSBI.BigInt("900")),
          JSBI.BigInt(data.reserveAltAmount)
        ),
        JSBI.add(
          JSBI.multiply(
            JSBI.BigInt(data.reserveXioAmount),
            JSBI.BigInt("1000")
          ),
          JSBI.multiply(_calculateXpy, JSBI.BigInt("900"))
        )
      );
      // reward = String(_reward);
      // initializeFlashstakeProtocolContract();
      // initializeFlashstakePoolContract(id);
      // let _amountIn = await calculateXPY(Web3.utils.toWei(xioQuantity), days);
      // reward = await getAPYStake(_amountIn);
      // console.log({ _reward: String(_reward), reward });
      reward = JSBI.subtract(
        JSBI.BigInt(_reward),
        JSBI.multiply(
          JSBI.divide(JSBI.BigInt(_reward), JSBI.BigInt(100)),
          JSBI.BigInt(5)
        )
      ).toString();
    }
  } catch (e) {
    _error("ERROR calculateReward -> ", e);
  }
  dispatch({
    type: "STAKE_REWARD",
    payload: reward,
  });
  dispatch(setLoading({ reward: false }));
};

export const calculateSwap = (altQuantity) => async (dispatch, getState) => {
  dispatch(setLoading({ swapReward: true }));
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
      swapAmount = JSBI.subtract(
        JSBI.BigInt(swapAmount),
        JSBI.multiply(
          JSBI.divide(JSBI.BigInt(swapAmount), JSBI.BigInt(100)),
          JSBI.BigInt(5)
        )
      ).toString();
    }
  } catch (e) {
    _error("ERROR calculateSwap -> ", e);
  }

  dispatch({
    type: "SWAP_OUTPUT",
    payload: Web3.utils.fromWei(swapAmount),
  });
  dispatch(setLoading({ swapReward: false }));
};

// const checkAllowanceMemo = _.memoize(
//   async (_address, _tokenAddress, _walletAddress, flag = false) => {
//     _log("Account", { _address, _tokenAddress, _walletAddress });
//     await initializeErc20TokenInfuraContract(_tokenAddress);
//     const _allowance = await allowance(_address);
//     return _allowance;
//   },
//   (_address, _tokenAddress, _walletAddress, flag = false) =>
//     _address + _tokenAddress + _walletAddress + flag
// );

const checkAllowanceMemo = async (_address, _tokenAddress, _walletAddress) => {
  _log("Account", { _address, _tokenAddress, _walletAddress });
  await initializeErc20TokenInfuraContract(_tokenAddress);
  const _allowance = await allowance(_address);
  return _allowance;
};

export const checkAllowance = () => async (dispatch, getState) => {
  dispatch(setLoading({ allowance: true }));
  try {
    const {
      flashstake: { selectedRewardToken },
      web3: { account },
    } = getState();
    const _allowance = await checkAllowanceMemo(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
      CONSTANTS.ADDRESS_XIO_RINKEBY,
      account
    );
    dispatch({
      type: "ALLOWANCE_XIO",
      payload: _allowance > 0,
    });

    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    const _allowance2 = await checkAllowanceMemo(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
      selectedRewardToken.tokenB.id,
      account
    );
    dispatch({
      type: "ALLOWANCE_ALT",
      payload: _allowance2 > 0,
    });
  } catch (e) {
    _error("ERROR checkAllowance -> ", e);
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

export const checkAllowancePool = () => async (dispatch, getState) => {
  dispatch(setLoading({ allowance: true }));
  try {
    const {
      flashstake: { selectedRewardToken },
      web3: { account },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    const _allowance = await checkAllowanceMemo(
      selectedRewardToken.id,
      CONSTANTS.ADDRESS_XIO_RINKEBY,
      account
    );
    _log(_allowance);

    console.log(_allowance);
    dispatch({
      type: "ALLOWANCE_XIO_POOL",
      payload: _allowance > 0,
    });

    const _allowance2 = await checkAllowanceMemo(
      selectedRewardToken.id,
      selectedRewardToken.tokenB.id,
      account
    );
    _log(_allowance2);
    dispatch({
      type: "ALLOWANCE_ALT_POOL",
      payload: _allowance2 > 0,
    });
  } catch (e) {
    _error("ERROR checkAllowance -> ", e);
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

// export const checkAllowanceXIO = () => async (dispatch, getState) => {
//   dispatch(setLoading({ allowance: true }));
//   try {
//     await initializeErc20TokenInfuraContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
//     const _allowance = await allowance(
//       CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
//     );
//     dispatch({
//       type: "ALLOWANCE_XIO",
//       payload: _allowance > 0,
//     });
//   } catch (e) {
//     _error("ERROR checkAllowance -> ", e);
//   } finally {
//     dispatch(setLoading({ allowance: false }));
//   }
// };

// export const checkAllowanceALT = () => async (dispatch, getState) => {
//   dispatch(setLoading({ allowance: true }));
//   try {
//     const {
//       flashstake: { selectedRewardToken },
//     } = getState();
//     if (!selectedRewardToken?.tokenB?.id) {
//       return null;
//     }
//     await initializeErc20TokenInfuraContract(selectedRewardToken.tokenB.id);
//     const _allowance = await allowance(
//       CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
//     );
//     dispatch({
//       type: "ALLOWANCE_ALT",
//       payload: _allowance > 0,
//     });
//   } catch (e) {
//     _error("ERROR checkAllowance -> ", e);
//   } finally {
//     dispatch(setLoading({ allowance: false }));
//   }
// };

export const getApprovalXIO = (tab) => async (dispatch, getState) => {
  setLoadingIndep({ approvalXIO: true });
  try {
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, tab);
    dispatch(checkAllowance());
  } catch (e) {
    _error("ERROR getApprovalXIO -> ", e);
  } finally {
    setLoadingIndep({ approval: false });
    setLoadingIndep({ approvalXIO: false });
  }
};

export const getApprovalALT = (_selectedPortal, tab) => async (
  dispatch,
  getState
) => {
  setLoadingIndep({ approvalALT: true });
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    await initializeErc20TokenContract(selectedRewardToken.tokenB.id);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, tab);
    dispatch(checkAllowance());
  } catch (e) {
    _error("ERROR getApprovalALT -> ", e);
  } finally {
    setLoadingIndep({ approvalALT: false });
  }
};

export const getApprovalXIOPool = (tab) => async (dispatch, getState) => {
  setLoadingIndep({ approvalXIO: true });
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(selectedRewardToken?.id, tab);
    dispatch(checkAllowancePool());
  } catch (e) {
    _error("ERROR getApprovalXIO -> ", e);
  } finally {
    setLoadingIndep({ approval: false });
    setLoadingIndep({ approvalXIO: false });
  }
};

export const getApprovalALTPool = (_selectedPortal, tab) => async (
  dispatch,
  getState
) => {
  setLoadingIndep({ approvalALT: true });
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      return null;
    }
    await initializeErc20TokenContract(selectedRewardToken?.tokenB?.id);
    await approve(selectedRewardToken?.id, tab);

    dispatch(checkAllowancePool());
  } catch (e) {
    _error("ERROR getApprovalALT -> ", e);
  } finally {
    setLoadingIndep({ approvalALT: false });
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
    _error("ERROR setSelectedStakeToken -> ", e);
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
    _error("ERROR setSelectedStakeToken -> ", e);
  }
};

export const getBalanceALT = () => async (dispatch, getState) => {
  let balance = 0;
  try {
    const {
      web3: { active, account },
      flashstake: { selectedRewardToken },
      user: { walletBalances },
    } = getState();
    if (!selectedRewardToken?.tokenB?.id) {
      dispatch({
        type: "BALANCE_ALT",
        payload: balance,
      });
      return null;
    }
    if (active && account) {
      balance = walletBalances[selectedRewardToken.tokenB.id] || 0;
    }
  } catch (e) {
    balance = 0;
    _error("ERROR getBalance -> ", e);
  } finally {
    dispatch({
      type: "BALANCE_ALT",
      payload: balance,
    });
  }
};

export const getBalanceXIO = () => async (dispatch, getState) => {
  let balance = 0;
  try {
    const {
      web3: { active, account },
      user: { walletBalances },
    } = getState();
    if (active && account) {
      balance = walletBalances[CONSTANTS.ADDRESS_XIO_RINKEBY] || 0;
    }
  } catch (e) {
    balance = 0;
    _error("ERROR getBalance -> ", e);
  } finally {
    dispatch({
      type: "BALANCE_XIO",
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
      throw new _error("No reward token found!");
    }
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
    _log(
      "stake params -> ",
      selectedRewardToken.tokenB.id,
      Web3.utils.toWei(xioQuantity),
      days,
      reward
    );
    await stake(
      selectedRewardToken.tokenB.id,
      Web3.utils.toWei(xioQuantity),
      days,
      reward
    );
  } catch (e) {
    _error("ERROR stake -> ", e);
    setDialogStepIndep("failedStake");
    showSnackbarIndep("Stake Transaction Failed.", "error");
  }
};

export const unstakeEarly = (unstakeAll = true) => async (
  dispatch,
  getState
) => {
  try {
    const {
      user: { stakes, expiredTimestamps, dappBalance },
      dashboard: { selectedStakes },
    } = await getState();
    console.log(dappBalance, stakes?.length);
    if (dappBalance <= 0 || !stakes?.length) {
      throw new _error("No stakes to withdraw!");
    }

    let _balanceUnstake = 0;
    let _unstakeTimestamps = [];

    if (unstakeAll) {
      _balanceUnstake = dappBalance;
      _unstakeTimestamps = stakes.map((_stake) => _stake.id);
    } else {
      _unstakeTimestamps = stakes.filter((_stake) => {
        if (selectedStakes[_stake.id]) {
          _balanceUnstake += parseFloat(_stake.stakeAmount);
          return true;
        } else {
          return false;
        }
      });
    }

    dispatch({
      type: "UNSTAKE_REQUEST",
      payload: {
        timestamps: _unstakeTimestamps,
        quantity: _balanceUnstake,
      },
    });
    initializeFlashstakeProtocolContract();
    console.log(_unstakeTimestamps);
    _log(
      "unstake params -> ",
      _unstakeTimestamps,
      Web3.utils.toWei(_balanceUnstake)
    );
    await unstake(expiredTimestamps, Web3.utils.toWei(_balanceUnstake));
  } catch (e) {
    _error("ERROR unstakeEarly -> ", e);
  }
};

export const unstakeXIO = () => async (dispatch, getState) => {
  try {
    const {
      user: { expiredTimestamps, expiredDappBalance },
    } = await getState();
    if (
      expiredDappBalance <= 0 ||
      !expiredTimestamps ||
      expiredTimestamps?.length <= 0
    ) {
      throw new _error("No stake to withdraw!");
    }
    dispatch({
      type: "UNSTAKE_REQUEST",
      payload: {
        timestamps: expiredTimestamps,
        quantity: expiredDappBalance,
      },
    });
    initializeFlashstakeProtocolContract();
    console.log(expiredTimestamps);
    _log(
      "unstake params -> ",
      expiredTimestamps,
      Web3.utils.toWei(expiredDappBalance)
    );
    await unstake(expiredTimestamps, Web3.utils.toWei(expiredDappBalance));
  } catch (e) {
    _error("ERROR unstake -> ", e);
  }
};

export const swapALT = (_altQuantity) => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedRewardToken, swapOutput },
    } = await getState();
    if (_altQuantity > 0 && selectedRewardToken?.id) {
      dispatch({
        type: "SWAP_REQUEST",
        payload: {
          amount: _altQuantity,
          token: selectedRewardToken.tokenB.symbol,
          swapOutput,
        },
      });
      initializeFlashstakeProtocolContract();
      _log(
        "swap params -> ",
        _altQuantity,
        selectedRewardToken.tokenB.id,
        Web3.utils.toWei(swapOutput)
      );

      await swap(
        Web3.utils.toWei(_altQuantity),
        selectedRewardToken.tokenB.id,
        Web3.utils.toWei(swapOutput)
      );
    }
  } catch (e) {
    _error("ERROR swap -> ", e);
    setSwapDialogStepIndep("failedSwap");
    showSnackbarIndep("Swap Transaction Failed.", "error");
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

export const setSwapDialogStep = (step) => {
  return {
    type: "SWAP_DIALOG_STEP",
    payload: step,
  };
};
export const setPoolDialogStep = (step) => {
  return {
    type: "POOL_DIALOG_STEP",
    payload: step,
  };
};

export const setSwapDialogStepIndep = (step) => {
  store.dispatch(setSwapDialogStep(step));
};

export const setPoolDialogStepIndep = (step) => {
  store.dispatch(setPoolDialogStep(step));
};

// export const setReset = (val) => {
//   return {
//     type: "RESET",
//     payload: val,
//   };
// };

export const setResetIndep = (val) => {
  // store.dispatch(setReset(val));
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
