import { JSBI } from "@uniswap/sdk";
import _ from "lodash";
import axios from "axios";
import Web3 from "web3";
import { CONSTANTS } from "../../utils/constants";
import { setLoading } from "./uiActions";
import {
  initializeBalanceContract,
  getBalances,
  getPoolBalances,
} from "../../utils/contractFunctions/balanceContractFunctions";
import { getBalanceALT, getBalanceXIO } from "./flashstakeActions";
import { _error } from "../../utils/log";
import {
  initializeFlashProtocolContract,
  getFPY,
} from "../../utils/contractFunctions/flashProtocolContractFunctions";
import {
  initializeFlashstakePoolContract,
  getAPYStake,
} from "../../utils/contractFunctions/flashstakePoolContractFunctions";
import {
  totalSupply,
  initializeErc20TokenContract,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import { getQueryData } from "./queryActions";

export const _getTokenPrice = _.memoize(async () => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${Object.values(
      CONSTANTS.MAINNET_ADDRESSES
    ).join(",")}&vs_currencies=USD`
  );
  return response;
});

export const _getFPY = _.memoize(async () => {
  await initializeFlashProtocolContract();
  const _fpy = await getFPY();
  return _fpy;
});

export const _getAPYStake = _.memoize(async (_pool, _xpy) => {
  await initializeFlashstakePoolContract(_pool);
  const _apyStake = Web3.utils.fromWei(await getAPYStake(_xpy));
  return _apyStake;
});

export const updatePools = (data) => async (dispatch) => {
  let _pools = [];
  let _tokenList = [];
  try {
    if (data?.length) {
      _pools = JSON.parse(JSON.stringify(data));
      dispatch({
        type: "POOL",
        payload: _pools,
      });
      _tokenList = _pools.map((_pool) => _pool.tokenB.id);
      let response;
      try {
        response = await _getTokenPrice();
      } catch (e) {
        _error("ERROR pricingAPI -> ", e);
      }
      if (response?.data) {
        const _fpy = await _getFPY();
        for (let i = 0; i < _pools.length; i++) {
          _pools[i].tokenPrice =
            response.data[CONSTANTS.MAINNET_ADDRESSES[_pools[i].tokenB.symbol]]
              .usd || 0;
          const _apyStake = await _getAPYStake(_pools[i].id, _fpy);

          _pools[i].apy =
            ((_apyStake * _pools[i].tokenPrice) /
              response.data[CONSTANTS.MAINNET_ADDRESSES.XIO].usd || 0) * 100;
        }
      }
    }
  } catch (e) {
    _error("ERROR updatePools -> ", e);
  } finally {
    dispatch(setLoading({ dapp: false }));
    dispatch({
      type: "POOL",
      payload: _pools,
    });
    dispatch({
      type: "TOKEN_LIST",
      payload: [CONSTANTS.ADDRESS_XIO_RINKEBY, ..._tokenList],
    });
    dispatch(updateAllBalances());
  }
};

const getPercentageUnStaked = async (_stake) => {
  const _queryData = await getQueryData(_stake.pool.id);
  const _precision = JSBI.BigInt(Web3.utils.toWei("1"));
  const _locked = JSBI.subtract(
    JSBI.BigInt(_queryData.flashBalance),
    JSBI.BigInt(_stake.amountIn)
  );
  const _percentage = JSBI.divide(
    JSBI.multiply(_locked, _precision),
    JSBI.BigInt(_queryData.totalSupply)
  );
  return _percentage;
};

const getInvFPY = async (_stake) => {
  const _precision = JSBI.BigInt(Web3.utils.toWei("1"));
  const _getPercentageUnStaked = await getPercentageUnStaked(_stake);
  // console.log({ _getPercentageUnStaked: _getPercentageUnStaked.toString() });
  return JSBI.subtract(_precision, _getPercentageUnStaked);
};

export const calculateBurnSingleStake = async (_stake) => {
  let _burnAmount = JSBI.BigInt(0);
  const _expiry = parseFloat(_stake.expireAfter);
  const _currentTime = parseFloat(Date.now() / 1000);
  if (_expiry > _currentTime) {
    const _precision = JSBI.BigInt(Web3.utils.toWei("1"));
    let _remainingDays = _expiry - _currentTime;
    _remainingDays = _remainingDays > 0 ? _remainingDays : 0;
    const _getInvFpy = await getInvFPY(_stake);

    _burnAmount = JSBI.divide(
      JSBI.multiply(
        JSBI.multiply(
          JSBI.BigInt(_stake.amountIn),
          JSBI.BigInt(String(Math.trunc(_remainingDays)))
        ),
        _getInvFpy
      ),
      JSBI.multiply(JSBI.BigInt(String(Math.trunc(_stake.expiry))), _precision)
    );
  }

  return _burnAmount.toString();
};

export const updateUserData = (data) => async (dispatch, getState) => {
  try {
    let stakes;
    let swapHistory;
    let expiredTimestamps = [];
    let dappBalance = JSBI.BigInt(0);
    let expiredDappBalance = JSBI.BigInt(0);
    let totalBurnAmount = JSBI.BigInt(0);
    if (data) {
      stakes = await Promise.all(
        data.stakes.map(async (_tempData) => {
          const { id, amountIn, expireAfter, rewardAmount } = _tempData;

          let expired = parseFloat(expireAfter) < Date.now() / 1000;
          dappBalance = JSBI.add(dappBalance, JSBI.BigInt(amountIn));
          let _burnAmount = "0";
          if (expired) {
            expiredDappBalance = JSBI.add(
              expiredDappBalance,
              JSBI.BigInt(amountIn)
            );
            expiredTimestamps.push(id);
          } else {
            _burnAmount = await calculateBurnSingleStake(_tempData);
            totalBurnAmount = JSBI.add(
              totalBurnAmount,
              JSBI.BigInt(_burnAmount)
            );
          }
          return {
            ..._tempData,
            stakeAmount: Web3.utils.fromWei(amountIn),
            rewardAmount: Web3.utils.fromWei(rewardAmount),
            expiryTime: parseFloat(expireAfter),
            expired,
            amountAvailable: expired ? Web3.utils.fromWei(amountIn) : "0",
            burnAmount: Web3.utils.fromWei(_burnAmount),
          };
        })
      );
      swapHistory = data.swapHistory.map((_swapHis) => ({
        ..._swapHis,
        swapAmount: Web3.utils.fromWei(_swapHis.swapAmount),
        flashReceived: Web3.utils.fromWei(_swapHis.flashReceived),
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
          totalBurnAmount: Web3.utils.fromWei(totalBurnAmount.toString()),
          totalBalanceWithBurn: Web3.utils.fromWei(
            String(JSBI.subtract(dappBalance, totalBurnAmount))
          ),
        },
      });
      dispatch(updateAllBalances());
    } else {
      dispatch({
        type: "USER_DATA",
        payload: {
          swapHistory: [],
          stakes: [],
          dappBalance: "0",
          expiredDappBalance: "0",
          expiredTimestamps: [],
          totalBurnAmount: "0",
          totalBalanceWithBurn: "0",
        },
      });
    }
  } catch (e) {
    _error("ERROR updateUserData -> ", e);
  }
};

export const clearUserData = () => (dispatch) => {
  dispatch({
    type: "USER_DATA",
    payload: {
      swapHistory: [],
      stakes: [],
      dappBalance: "0",
      expiredDappBalance: "0",
      expiredTimestamps: [],
    },
  });
  dispatch({
    type: "WALLET_BALANCE",
    payload: "0",
  });
  dispatch({
    type: "WALLET_BALANCE_USD",
    payload: "0",
  });
  dispatch({
    type: "WALLET_BALANCES",
    payload: {},
  });
};

const getBalancesIntervaled = (function () {
  let _lastCalledTimestamp = 0;
  let _lastOutput;
  let _account = "";
  let _poolsLenght = 0;
  return async (account, poolsLenght) => {
    if (
      Date.now() - _lastCalledTimestamp >= 15000 ||
      _account !== account ||
      _poolsLenght !== poolsLenght
    ) {
      try {
        await initializeBalanceContract();
        _lastOutput = await getBalances();
        _lastCalledTimestamp = Date.now();
        _account = account;
        return _lastOutput;
      } catch (e) {
        _error("ERROR getBalancesIntervaled -> ", e);
        _lastCalledTimestamp = 0;
      }
    } else {
      return _lastOutput;
    }
  };
})();

export const updateAllBalances = () => async (dispatch, getState) => {
  try {
    const {
      web3: { account },
      user: { pools },
    } = await getState();
    const [
      _balances,
      walletBalanceUSD,
      _poolBalances,
    ] = await getBalancesIntervaled(account, pools.length);
    dispatch({
      type: "WALLET_BALANCE",
      payload: _balances[CONSTANTS.ADDRESS_XIO_RINKEBY] || "0",
    });
    dispatch({
      type: "WALLET_BALANCES",
      payload: _balances,
    });
    dispatch({
      type: "WALLET_BALANCE_USD",
      payload: walletBalanceUSD,
    });
    dispatch({
      type: "WALLET_BALANCES_POOL",
      payload: _poolBalances,
    });
    dispatch({
      type: "POOL_DASHBOARD_DATA",
      payload: Object.keys(_poolBalances)
        .filter((_poolKey) => _poolBalances[_poolKey] > 0)
        .map((_poolKey) => ({
          pool: pools.find((_pool) => _pool.id === _poolKey),
          balance: _poolBalances[_poolKey],
        })),
    });
    dispatch(getBalanceXIO());
    dispatch(getBalanceALT());
  } catch (e) {
    _error("ERROR updateAllBalances -> ", e);
  }
};

export const setPoolData = (data) => {
  console.log(data);
  return {
    type: "POOL_DATA",
    payload: data,
  };
};
export const setPoolDataBalance = (data) => {
  return {
    type: "POOL_DATA_BALANCE",
    payload: data,
  };
};
export const setPoolItems = (data) => {
  return {
    type: "POOL_ITEMS",
    payload: data,
  };
};
export const setTotalSupply = async (data) => {
  // console.log(data);
  await initializeErc20TokenContract(data);
  const _data = await totalSupply(data);
  // console.log(_data);
  return {
    type: "TOTAL_SUPPLY",
    payload: _data,
  };
};
