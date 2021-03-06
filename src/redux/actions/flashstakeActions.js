import Web3 from "web3";
import { store } from "../../config/reduxStore";
import {
  initializeErc20TokenContract,
  allowance,
  approve,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import {
  initializeFlashstakeProtocolContract,
  unstake,
  addLiquidityInPool,
  removeLiquidityInPool,
  createPool as createPoolContract,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import {
  initializeFlashProtocolContract,
  stake,
  unstakeEarly as unstakeEarlyFunc,
} from "../../utils/contractFunctions/flashProtocolContractFunctions";
import {
  setLoading,
  setLoadingIndep,
  showSnackbarIndep,
  setPercentLoader,
} from "./uiActions";
import {
  initializeEthToWethContract,
  deposit,
} from "../../utils/contractFunctions/ethToWethContractFunctions";
import { getQueryData } from "./queryActions";
import { CONSTANTS } from "../../utils/constants";
import { swap } from "../../utils/contractFunctions/FlashStakeProtocolContract";
import { JSBI } from "@uniswap/sdk";
import { _log, _error } from "../../utils/log";
import { utils } from "ethers";
import { updateApyPools, _getTokenPrice } from "./userActions";
import { setRefetchProtocols } from "./dashboardActions";
import { trunc } from "../../utils/utilFunc";
import { getTokenPrices } from "../../utils/tokenPrices";

export const changeQuantityRedux = (quantity) => async (dispatch) => {
  dispatch({
    type: "STAKE_QTY",
    payload: quantity,
  });

  dispatch(updateApyPools(quantity));
};

export const rewardPercentage = (
  quantity,
  days,
  timeUnit,
  preciseReward
) => async (dispatch, getState) => {
  let rewardPercent = {};
  try {
    setPercentLoader(true);
    const {
      flashstake: {
        // preciseReward,
        reward,
        selectedRewardToken,
      },
      user: { pools },
      ui: { percentLoader },
    } = getState();
    let response = await _getTokenPrice([
      ...pools.map((_pools) => _pools.tokenB.id),
      CONSTANTS.MAINNET_ADDRESSES.FLASH,
    ]);

    if (response?.data && days && quantity) {
      for (let i = 0; i < pools.length; i++) {
        const tokenPrice = response?.data[pools[i]?.tokenB?.id]?.usd || 0;

        let time =
          timeUnit === "Days" ? 365 : timeUnit === "Mins" ? 525600 : 8760;
        rewardPercent[pools[i]?.id] =
          (((time / days) *
            utils.formatUnits(
              preciseReward.toString(),
              selectedRewardToken?.tokenB?.decimals || 18
            ) *
            tokenPrice) /
            (quantity *
              response?.data["0xb4467e8d621105312a914f1d42f10770c0ffe3c8"]
                ?.usd)) *
          100;
      }
    }

    dispatch({
      type: "REWARD_PERCENTAGE",
      payload: rewardPercent,
    });
  } catch (e) {
    _error("ERROR calculating Reward percentage", e);
  }
  setPercentLoader(false);
};

export const calculateReward = (xioQuantity, days, time) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ reward: true }));
  let reward = "0";
  dispatch({
    type: "FPY_CAL",
    payload: "",
  });
  try {
    const {
      flashstake: {
        selectedRewardToken: { id },
        slip,
      },
    } = getState();
    if (id && xioQuantity > 0 && days > 0) {
      const data = await getQueryData(id);
      const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
      const _zero = JSBI.BigInt("0");
      const _quantity = JSBI.BigInt(
        utils.parseUnits(xioQuantity.toString(), 18)
      );
      const _multiplier =
        time === "Mins" ? "60" : time === "Hrs" ? "3600" : "86400";
      const _days = JSBI.BigInt(Math.trunc(days));
      const _expiry = JSBI.multiply(_days, JSBI.BigInt(_multiplier));
      const _getPercentStaked = JSBI.divide(
        JSBI.multiply(
          JSBI.add(JSBI.BigInt(data.flashBalance), _quantity),
          _precision
        ),
        JSBI.BigInt(data.totalSupply)
      );
      const _fpy = JSBI.divide(
        JSBI.subtract(_precision, _getPercentStaked),
        JSBI.BigInt("2")
      );
      if (_fpy.toString() < 0) {
        dispatch({
          type: "MAX_DAYS",
          payload: 0,
        });
        dispatch({
          type: "STAKE_REWARD",
          payload: 0,
        });
        dispatch({
          type: "FPY_CAL",
          payload: _fpy.toString(),
        });
        return;
      }
      let _maxDays = (5e17 * 365 * 86400) / String(_fpy);

      dispatch({
        type: "MAX_DAYS",
        payload: _maxDays,
      });

      const _mintAmount = JSBI.divide(
        JSBI.multiply(JSBI.multiply(_quantity, _expiry), _fpy),
        JSBI.multiply(_precision, JSBI.BigInt("31536000"))
      );
      //fpy of 0
      const _getPercentStaked0 = JSBI.divide(
        JSBI.multiply(
          JSBI.add(JSBI.BigInt(data.flashBalance), _zero),
          _precision
        ),
        JSBI.BigInt(data.totalSupply)
      );
      const _fpy0 = JSBI.divide(
        JSBI.subtract(_precision, _getPercentStaked0),
        JSBI.BigInt("2")
      );
      //-----------------
      const _lpFee = JSBI.subtract(
        JSBI.BigInt("1000"),
        JSBI.divide(_fpy0, JSBI.BigInt(5e15))
      );

      const _reward = JSBI.divide(
        JSBI.multiply(
          JSBI.multiply(_mintAmount, _lpFee),
          JSBI.BigInt(data.reserveAltAmount)
        ),
        JSBI.add(
          JSBI.multiply(
            JSBI.BigInt(data.reserveFlashAmount),
            JSBI.BigInt("1000")
          ),
          JSBI.multiply(_mintAmount, _lpFee)
        )
      );

      dispatch({
        type: "PRECISE_STAKE_REWARD",
        payload: _reward.toString(),
      });
      dispatch(rewardPercentage(xioQuantity, days, time, _reward.toString()));
      // await initializeFlashstakePoolContract(id);
      // const _apyStake = await getAPYStake(String(_mintAmount));
      _log("reward ==>", {
        xioQuantity,
        days,
        _reward: utils.formatUnits(_reward.toString(), 18),
      });

      reward = JSBI.subtract(
        JSBI.BigInt(_reward),
        JSBI.multiply(
          JSBI.divide(JSBI.BigInt(_reward), JSBI.BigInt(100)),
          JSBI.BigInt(slip)
        )
      ).toString();
    }
  } catch (e) {
    _error("ERROR calculateReward -> ", e);
    // rewardPercentage(xioQuantity, days, time, _reward.toString());
  }
  dispatch({
    type: "STAKE_REWARD",
    payload: reward,
  });

  dispatch(setLoading({ reward: false }));
};

export const calculateSwap = (altQuantity, forceRefetchQuery = false) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ swapReward: true }));
  let swapAmount = "0";
  try {
    const {
      flashstake: {
        selectedRewardToken: {
          id,
          tokenB: { decimals },
        },
        slip,
      },
    } = getState();
    if (id && altQuantity > 0) {
      const data = await getQueryData(id, forceRefetchQuery);
      const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
      const _zero = JSBI.BigInt("0");
      const _getPercentStaked0 = JSBI.divide(
        JSBI.multiply(
          JSBI.add(JSBI.BigInt(data.flashBalance), _zero),
          _precision
        ),
        JSBI.BigInt(data.totalSupply)
      );
      const _fpy0 = JSBI.divide(
        JSBI.subtract(_precision, _getPercentStaked0),
        JSBI.BigInt("2")
      );
      const _lpFee = JSBI.subtract(
        JSBI.BigInt("1000"),
        JSBI.divide(_fpy0, JSBI.BigInt(5e15))
      );

      const _amountInWithFee = JSBI.multiply(
        JSBI.BigInt(utils.parseUnits(altQuantity.toString(), decimals)),
        _lpFee
      );
      // ///////////////////
      const _swapAmount = JSBI.divide(
        JSBI.multiply(_amountInWithFee, JSBI.BigInt(data.reserveFlashAmount)),
        JSBI.add(
          JSBI.multiply(
            JSBI.BigInt(data.reserveAltAmount),
            JSBI.BigInt("1000")
          ),
          _amountInWithFee
        )
      );

      dispatch({
        type: "PRECISE_SWAP_REWARD",
        payload: utils.formatUnits(_swapAmount.toString(), 18),
      });

      swapAmount = JSBI.subtract(
        _swapAmount,
        JSBI.multiply(
          JSBI.divide(_swapAmount, JSBI.BigInt(100)),
          JSBI.BigInt(slip)
        )
      ).toString();
    }
  } catch (e) {
    _error("ERROR calculateSwap -> ", e);
  }
  // const {
  //   flashstake: {
  //     selectedRewardToken: {
  //       tokenB: { decimal },
  //     },
  //   },
  // } = getState();

  dispatch({
    type: "SWAP_OUTPUT",
    payload: utils.formatUnits(swapAmount.toString(), 18),
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
    const _allowance3 = await checkAllowanceMemo(
      CONSTANTS.FLASH_PROTOCOL_CONTRACT,
      CONSTANTS.ADDRESS_XIO_RINKEBY,
      account
    );
    dispatch({
      type: "ALLOWANCE_XIO_PROTOCOL",
      payload: _allowance3 > 0,
    });

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
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
      CONSTANTS.ADDRESS_XIO_RINKEBY,
      account
    );
    _log("Allowance Pool -> ", _allowance);
    dispatch({
      type: "ALLOWANCE_XIO_POOL",
      payload: _allowance > 0,
    });

    const _allowance2 = await checkAllowanceMemo(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
      selectedRewardToken.tokenB.id,
      account
    );
    _log("Allowance Pool Alt -> ", _allowance2);

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

export const checkAllowancePoolWithdraw = (_poolId) => async (
  dispatch,
  getState
) => {
  dispatch(setLoading({ allowance: true }));
  try {
    const {
      web3: { account },
    } = await getState();
    if (_poolId || account) {
      const _allowance = await checkAllowanceMemo(
        CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
        _poolId,
        account
      );
      _log("checkAllowancePoolWithdraw -> ", _allowance);

      dispatch({
        type: "ALLOWANCE_POOL_WITHDRAW",
        payload: _allowance > 0,
      });
    }
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
    await approve(CONSTANTS.FLASH_PROTOCOL_CONTRACT, "stake");
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

export const getApprovalXIOPool = () => async (dispatch, getState) => {
  setLoadingIndep({ approval: true });
  setLoadingIndep({ approvalXIO: true });
  try {
    await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, "pool", true);
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
    await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, "pool");

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
      type: "REWARD_PERCENTAGE",
      payload: 0,
    });
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
      balance =
        walletBalances[String(selectedRewardToken.tokenB.id).toLowerCase()] ||
        0;
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
      balance =
        walletBalances[String(CONSTANTS.ADDRESS_XIO_RINKEBY).toLowerCase()] ||
        0;
    }
  } catch (e) {
    balance = 0;
    _error("ERROR getBalanceXIO -> ", e);
  } finally {
    dispatch({
      type: "BALANCE_XIO",
      payload: balance,
    });
  }
};

export const stakeXIO = (xioQuantity, days, time) => async (
  dispatch,
  getState
) => {
  try {
    const {
      flashstake: { selectedRewardToken, reward },
    } = await getState();
    if (!selectedRewardToken?.tokenB?.id) {
      throw new _error("No reward token found!");
    }
    const _multiplier =
      time === "Mins" ? "60" : time === "Hrs" ? "3600" : "86400";
    const _days = days * _multiplier;
    dispatch({
      type: "STAKE_REQUEST",
      payload: {
        token: selectedRewardToken.tokenB.symbol,
        quantity: xioQuantity,
        days,
        reward: utils.formatUnits(
          reward.toString(),
          selectedRewardToken?.tokenB?.decimals
        ),
      },
    });
    initializeFlashProtocolContract();
    _log(
      "stake params -> ",
      utils.parseUnits(xioQuantity.toString(), 18).toString(),
      _days,
      selectedRewardToken.tokenB.id,
      reward
    );

    await stake(
      utils.parseUnits(xioQuantity.toString(), 18).toString(),
      _days,
      utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [selectedRewardToken.tokenB.id, reward]
      )
    );
  } catch (e) {
    _error("ERROR stake -> ", e);
    setDialogStepIndep("failedStake");
    showSnackbarIndep("Stake Transaction Failed.", "error");
  }
};

export const unstakeEarlyFlash = (unstakeAll = true) => async (
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

export const unstakeEarly = () => async (dispatch, getState) => {
  try {
    const {
      user: { stakes, dappBalance },
      dashboard: { selectedStakes },
    } = await getState();

    if (dappBalance <= 0 || !stakes?.length) {
      throw new _error("No stakes to withdraw!");
    }
    const _selectedIds = Object.keys(selectedStakes).filter(
      (_key) => selectedStakes[_key]
    );
    let _quantity = 0;
    const _selectedStakes = stakes.filter((_stake) => {
      if (_selectedIds.includes(_stake.id)) {
        _quantity += parseFloat(_stake.stakeAmount);
        return true;
      }
      return false;
    });
    dispatch({
      type: "UNSTAKE_REQUEST",
      payload: {
        timestamps: _selectedIds,
        quantity: _quantity,
      },
    });
    if (_selectedIds.length === 1 && _selectedStakes[0].burnAmount > 0) {
      await initializeFlashProtocolContract();
      await unstakeEarlyFunc(_selectedIds[0]);
    } else {
      await initializeFlashstakeProtocolContract();
      await unstake(_selectedIds);
    }

    // let _balanceUnstake = 0;
    // let _unstakeTimestamps = [];

    // if (unstakeAll) {
    //   _balanceUnstake = dappBalance;
    //   _unstakeTimestamps = stakes.map((_stake) => _stake.id);
    // } else {
    //   _unstakeTimestamps = stakes
    //     .filter((_stake) => {
    //       if (selectedStakes[_stake.id]) {
    //         _balanceUnstake += parseFloat(_stake.stakeAmount);
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     })
    //     .map((_stake) => _stake.id);
    // }

    //

    // _log(
    //   "unstake params -> ",
    //   _unstakeTimestamps
    //   // Web3.utils.toWei(_balanceUnstake)
    // );
    //
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
    _log("unstake params -> ", expiredTimestamps);
    await unstake(expiredTimestamps);
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
        utils
          .parseUnits(
            _altQuantity?.toString(),
            selectedRewardToken?.tokenB?.decimals
          )
          .toString(),
        selectedRewardToken.tokenB.id,
        utils.parseUnits(swapOutput.toString(), 18).toString()
      );

      await swap(
        utils
          .parseUnits(
            _altQuantity?.toString(),
            selectedRewardToken?.tokenB?.decimals
          )
          .toString(),
        selectedRewardToken.tokenB.id,
        utils.parseUnits(swapOutput.toString(), 18).toString()
      );
    }
  } catch (e) {
    _error("ERROR swap -> ", e);
    setSwapDialogStepIndep("failedSwap");
    showSnackbarIndep("Swap Transaction Failed.", "error");
  }
  dispatch({
    type: "RECALC_SWAP",
  });
};

export const addTokenLiquidityInPool = (
  quantityAlt,
  quantityXIO,
  selectedPortal
) => async (dispatch, getState) => {
  try {
    const {
      flashstake: { selectedRewardToken, slip },
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
      utils.parseUnits(quantityXIO.toString(), 18).toString(),
      utils
        .parseUnits(
          quantityAlt.toString(),
          selectedRewardToken?.tokenB?.decimals
        )
        .toString(),
      utils
        .parseUnits(
          String(
            (quantityXIO * (1 - slip / 100)).toFixed(
              selectedRewardToken?.tokenB?.decimals
            )
          ),
          18
        )
        .toString(),
      utils
        .parseUnits(
          String(
            (quantityAlt * (1 - slip / 100)).toFixed(
              selectedRewardToken?.tokenB?.decimals
            )
          ),
          selectedRewardToken?.tokenB?.decimals
        )
        .toString(),
      selectedRewardToken.tokenB.id
    );

    initializeFlashstakeProtocolContract();
    await addLiquidityInPool(
      utils.parseUnits(quantityXIO.toString(), 18).toString(),
      utils
        .parseUnits(
          quantityAlt.toString(),
          selectedRewardToken?.tokenB?.decimals
        )
        .toString(),
      utils
        .parseUnits(
          String(
            (quantityXIO * (1 - slip / 100)).toFixed(
              selectedRewardToken?.tokenB?.decimals
            )
          ),
          18
        )
        .toString(),
      utils
        .parseUnits(
          String(
            (quantityAlt * (1 - slip / 100)).toFixed(
              selectedRewardToken?.tokenB?.decimals
            )
          ),
          selectedRewardToken?.tokenB?.decimals
        )
        .toString(),
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

// export const getApprovalXIOPool = () => async (dispatch, getState) => {
//   setLoadingIndep({ approval: true });
//   setLoadingIndep({ approvalXIO: true });
//   try {
//     await initializeErc20TokenContract(CONSTANTS.ADDRESS_XIO_RINKEBY);
//     await approve(CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS, "pool", true);
//     dispatch(checkAllowancePool());
//   } catch (e) {
//     _error("ERROR getApprovalXIO -> ", e);
//   } finally {
//     setLoadingIndep({ approval: false });
//     setLoadingIndep({ approvalXIO: false });
//   }
// };

export const getApprovalPoolLiquidity = (poolID, success) => async (
  dispatch,
  getState
) => {
  try {
    const {
      flashstake: { poolDashboard },
    } = await getState();
    const _pool = poolDashboard.find((_pool) => _pool.pool.id === poolID);
    if (!_pool?.balance) {
      return;
    }
    setLoadingIndep({ approvalWithdrawPool: true });
    await initializeErc20TokenContract(_pool.pool.id);
    await approve(
      CONSTANTS.FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
      "pool",
      true,
      success
    );
    dispatch(checkAllowancePoolWithdraw(poolID));
  } catch (e) {
    _error("ERROR getApprovalPoolLiquidity -> ", e);
  } finally {
    setLoadingIndep({ approvalWithdrawPool: false });
  }
};

export const removeTokenLiquidityInPool = (_pool, percentageToRemove) => async (
  dispatch,
  getState
) => {
  try {
    if (!_pool?.balance) {
      return;
    }

    const {
      flashstake: { selectedRewardToken },
    } = await getState();

    const removeLiquidity = String(
      JSBI.divide(
        JSBI.multiply(
          JSBI.BigInt(
            utils.parseUnits(
              String(_pool.balance),
              selectedRewardToken?.tokenB?.decimal
            )
          ),
          JSBI.BigInt(percentageToRemove)
        ),
        JSBI.BigInt(100)
      )
    );

    dispatch({
      type: "WITHDRAW_LIQUIDITY_REQUEST",
      payload: {
        _liquidity: utils.formatUnits(
          removeLiquidity,
          selectedRewardToken?.tokenB?.decimal
        ),
        _token: _pool.pool.tokenB.symbol,
      },
    });
    _log("removeLiquidityInPool -> ", removeLiquidity, _pool.pool.tokenB.id);
    initializeFlashstakeProtocolContract();
    await removeLiquidityInPool(removeLiquidity, _pool.pool.tokenB.id);
  } catch (e) {
    _error("ERROR removeTokenLiquidityInPool -> ", e);
  }
};

export const depositEth = (_quantity, inPool) => async (dispatch, getState) => {
  const {
    user: { walletBalances },
  } = getState();
  console.log(" IN HERE ", _quantity);
  try {
    initializeEthToWethContract();
    deposit(utils.parseUnits(_quantity.toString(), 18).toString(), inPool);
  } catch (e) {
    console.log("ERROR ->", e);
  }
};

export const createPool = (_token) => async (dispatch, getState) => {
  const {
    user: { pools },
  } = getState();

  try {
    if (!Web3.utils.isAddress(_token.address)) {
      return;
    }

    if (pools.find((_pool) => _pool?.tokenB?.id === _token.address)) {
      return;
    }

    _log("createPool params -> ", _token.address);
    dispatch({
      type: "CREATE_POOL_REQUEST",
      payload: {
        _token: _token,
      },
    });
    initializeFlashstakeProtocolContract();
    await createPoolContract(_token.address);
  } catch (e) {
    _error("ERROR createPool -> ", e);
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

export const setCreateDialogStep = (step) => {
  return {
    type: "CREATE_DIALOG_STEP",
    payload: step,
  };
};

export const setConvertDialogStep = (step, inPool) => {
  return {
    type: inPool ? "POOL_DIALOG_STEP" : "CONVERT_DIALOG_STEP",
    payload: step,
  };
};

export const setSwapDialogStepIndep = (step) => {
  store.dispatch(setSwapDialogStep(step));
};

export const setPoolDialogStepIndep = (step) => {
  store.dispatch(setPoolDialogStep(step));
};
export const setCreateDialogStepIndep = (step) => {
  store.dispatch(setCreateDialogStep(step));
};

export const setConvertDialogStepIndep = (step, inPool) => {
  store.dispatch(setConvertDialogStep(step, inPool));
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
export const setConvertTxnHash = (val) => {
  return {
    type: "CONVERT_TXN_HASH",
    payload: val,
  };
};

export const setStakeTxnHashIndep = (val) => {
  store.dispatch(setStakeTxnHash(val));
};
export const setConvertTxnHashIndep = (val) => {
  store.dispatch(setConvertTxnHash(val));
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

export const setCloseLiquidityTxnHashIndep = (val) => {
  store.dispatch(setCloseLiquidityTxnHash(val));
};
export const setCloseLiquidityTxnHash = (val) => {
  return {
    type: "CLOSE_LIQDUIDITY_TXN_HASH",
    payload: val,
  };
};

export const setWithdrawLiquidityTxnHashIndep = (val) => {
  store.dispatch(setWithdrawLiquidityTxnHash(val));
};
export const setSlip = (val) => {
  return {
    type: "CUSTOM_SLIPPAGE",
    payload: val,
  };
};

export const setRemoveLiquidity = (data) => {
  return {
    type: "REMOVE_LIQUIDITY",
    payload: data,
  };
};
export const setMaxTimeDuration = (data) => {
  return {
    type: "MAX_TIME_DURATION",
    payload: data,
  };
};
