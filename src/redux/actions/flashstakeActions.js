import Web3 from "web3";
import { store } from "../../config/reduxStore";
import {
  initializeErc20TokenContract,
  allowance,
  approve,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import {
  initializeFlashstakeProtocolContract,
  stake,
  unstake,
  addLiquidityInPool,
  removeLiquidityInPool,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
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
      const _days = JSBI.BigInt(days);
      const _percent = JSBI.divide(
        JSBI.multiply(
          JSBI.add(JSBI.BigInt(data.xioBalance), _quantity),
          _precision
        ),
        JSBI.BigInt(data.totalSupply)
      );
      const _getPercentStaked = JSBI.greaterThan(_percent, _precision)
        ? _precision
        : _percent;

      const _fpy = JSBI.divide(
        JSBI.subtract(_precision, _getPercentStaked),
        JSBI.BigInt("2")
      );
      //getMintAmount
      const _output = JSBI.divide(
        JSBI.multiply(JSBI.multiply(_quantity, _days), _fpy),
        JSBI.multiply(_precision, JSBI.BigInt("365"))
      );
      const _limit = JSBI.divide(_quantity, JSBI.BigInt("2"));
      const _mintAmount = JSBI.greaterThan(_output, _limit) ? _limit : _output;
      const _reward = JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(_mintAmount, JSBI.BigInt("900")),
          JSBI.BigInt(data.reserveAltAmount)
        ),
        JSBI.add(
          JSBI.multiply(
            JSBI.BigInt(data.reserveXioAmount),
            JSBI.BigInt("1000")
          ),
          JSBI.multiply(_mintAmount, JSBI.BigInt("900"))
        )
      );

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
      const data = await getQueryData(id);

      const _amountInWithFee = JSBI.multiply(
        JSBI.BigInt(Web3.utils.toWei(altQuantity)),
        JSBI.BigInt("900")
      );

      const _swapAmount = JSBI.divide(
        JSBI.multiply(_amountInWithFee, JSBI.BigInt(data.reserveXioAmount)),
        JSBI.add(
          JSBI.multiply(
            JSBI.BigInt(data.reserveAltAmount),
            JSBI.BigInt("1000")
          ),
          _amountInWithFee
        )
      );

      swapAmount = JSBI.subtract(
        _swapAmount,
        JSBI.multiply(
          JSBI.divide(_swapAmount, JSBI.BigInt(100)),
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
//     await initializeErc20TokenContract(_tokenAddress);
//     const _allowance = await allowance(_address);
//     return _allowance;
//   },
//   (_address, _tokenAddress, _walletAddress, flag = false) =>
//     _address + _tokenAddress + _walletAddress + flag
// );

const checkAllowanceMemo = async (_address, _tokenAddress, _walletAddress) => {
  _log("Account", { _address, _tokenAddress, _walletAddress });
  await initializeErc20TokenContract(_tokenAddress);
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

export const checkAllowancePoolWithdraw = () => async (dispatch, getState) => {
  dispatch(setLoading({ allowance: true }));
  try {
    const {
      flashstake: { selectedWithdrawPool, poolDashboard },
      web3: { account },
    } = await getState();
    if (!selectedWithdrawPool || !account) {
      return null;
    }
    const _pool = poolDashboard.find(
      (_pool) => _pool.pool.id === selectedWithdrawPool
    );

    const _allowance = await checkAllowanceMemo(
      _pool.pool.id,
      _pool.pool.id,
      account
    );
    _log("checkAllowancePoolWithdraw -> ", _allowance);

    dispatch({
      type: "ALLOWANCE_POOL_WITHDRAW",
      payload: _allowance > 0,
    });
  } catch (e) {
    _error("ERROR checkAllowancePoolWithdraw -> ", e);
    dispatch({
      type: "ALLOWANCE_POOL_WITHDRAW",
      payload: false,
    });
  } finally {
    dispatch(setLoading({ allowance: false }));
  }
};

export const getApprovalXIO = (tab) => async (dispatch, getState) => {
  setLoadingIndep({ approvalXIO: true });
  try {
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, "stake");
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
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, "swap");
    dispatch(checkAllowance());
  } catch (e) {
    _error("ERROR getApprovalALT -> ", e);
  } finally {
    setLoadingIndep({ approvalALT: false });
  }
};

export const getApprovalXIOPool = (step = null) => async (
  dispatch,
  getState
) => {
  setLoadingIndep({ approvalXIO: true });
  try {
    const {
      flashstake: { selectedRewardToken },
    } = getState();
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(selectedRewardToken?.id, "pool", step);
    dispatch(checkAllowancePool());
  } catch (e) {
    _error("ERROR getApprovalXIO -> ", e);
  } finally {
    setLoadingIndep({ approval: false });
    setLoadingIndep({ approvalXIO: false });
  }
};

export const getApprovalALTPool = (_selectedPortal) => async (
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
    await approve(selectedRewardToken?.id, "pool");

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
      user: { stakes, dappBalance },
      dashboard: { selectedStakes },
    } = await getState();
    if (dappBalance <= 0 || !stakes?.length) {
      throw new _error("No stakes to withdraw!");
    }

    let _balanceUnstake = 0;
    let _unstakeTimestamps = [];

    if (unstakeAll) {
      _balanceUnstake = dappBalance;
      _unstakeTimestamps = stakes.map((_stake) => _stake.id);
    } else {
      _unstakeTimestamps = stakes
        .filter((_stake) => {
          if (selectedStakes[_stake.id]) {
            _balanceUnstake += parseFloat(_stake.stakeAmount);
            return true;
          } else {
            return false;
          }
        })
        .map((_stake) => _stake.id);
    }
    dispatch({
      type: "UNSTAKE_REQUEST",
      payload: {
        timestamps: _unstakeTimestamps,
        quantity: _balanceUnstake,
      },
    });
    initializeFlashstakeProtocolContract();

    _log(
      "unstake params -> ",
      _unstakeTimestamps
      // Web3.utils.toWei(_balanceUnstake)
    );
    await unstake(_unstakeTimestamps);
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

export const addTokenLiquidityInPool = (
  quantityAlt,
  quantityXIO,
  selectedPortal
) => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedRewardToken },
    } = await getState();
    dispatch({
      type: "LIQUIDITY_REQUEST",
      payload: {
        altSymbol: selectedRewardToken?.tokenB?.symbol,
        quantityXIO,
        quantityAlt,
      },
    });
    _log(
      "addTokenLiquidityInPool -> ",
      Web3.utils.toWei(String(quantityXIO)),
      Web3.utils.toWei(String(quantityAlt)),
      Web3.utils.toWei(String(quantityXIO * 0.95)),
      Web3.utils.toWei(String(quantityAlt * 0.95)),
      selectedRewardToken.tokenB.id
    );
    initializeFlashstakeProtocolContract();
    await addLiquidityInPool(
      Web3.utils.toWei(String(quantityXIO)),
      Web3.utils.toWei(String(quantityAlt)),
      Web3.utils.toWei(String(quantityXIO * 0.95)),
      Web3.utils.toWei(String(quantityAlt * 0.95)),
      selectedRewardToken.tokenB.id
    );
  } catch (e) {
    _error("ERROR addTokenLiquidityInPool -> ", e);
  }
};

export const onSelectWithdrawPool = (_poolId) => {
  return {
    type: "SELECT_WITHDRAW_POOL",
    payload: _poolId,
  };
};

export const getApprovalPoolLiquidity = () => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedWithdrawPool, poolDashboard },
    } = await getState();
    const _pool = poolDashboard.find(
      (_pool) => _pool.pool.id === selectedWithdrawPool
    );
    if (!_pool?.balance) {
      return;
    }
    setLoadingIndep({ approvalWithdrawPool: true });
    await initializeErc20TokenContract(_pool.pool.id);
    await approve(_pool.pool.id, "pool");
    dispatch(checkAllowancePoolWithdraw());
  } catch (e) {
    _error("ERROR getApprovalPoolLiquidity -> ", e);
  } finally {
    setLoadingIndep({ approvalWithdrawPool: false });
  }
};

export const removeTokenLiquidityInPool = () => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedWithdrawPool, poolDashboard },
    } = await getState();
    const _pool = poolDashboard.find(
      (_pool) => _pool.pool.id === selectedWithdrawPool
    );
    if (!_pool?.balance) {
      return;
    }
    dispatch({
      type: "WITHDRAW_LIQUIDITY_REQUEST",
      payload: {
        _liquidity: _pool.balance,
        _token: _pool.pool.tokenB.symbol,
      },
    });
    _log(
      "removeLiquidityInPool -> ",
      Web3.utils.toWei(String(_pool.balance)),
      _pool.pool.tokenB.id
    );
    initializeFlashstakeProtocolContract();
    await removeLiquidityInPool(
      Web3.utils.toWei(String(_pool.balance)),
      _pool.pool.tokenB.id
    );
  } catch (e) {
    _error("ERROR removeTokenLiquidityInPool -> ", e);
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
export const setLiquidityTxnHash = (val) => {
  return {
    type: "LIQDUIDITY_TXN_HASH",
    payload: val,
  };
};

export const setLiquidityTxnHashIndep = (val) => {
  store.dispatch(setLiquidityTxnHash(val));
};
export const setWithdrawLiquidityTxnHash = (val) => {
  return {
    type: "WITHDRAW_LIQDUIDITY_TXN_HASH",
    payload: val,
  };
};

export const setWithdrawLiquidityTxnHashIndep = (val) => {
  store.dispatch(setWithdrawLiquidityTxnHash(val));
};
