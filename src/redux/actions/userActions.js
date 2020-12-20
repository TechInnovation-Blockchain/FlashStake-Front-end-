import { JSBI } from "@uniswap/sdk";
import _ from "lodash";
import axios from "axios";
import Web3 from "web3";
import { CONSTANTS } from "../../utils/constants";
import { setLoading } from "./uiActions";
import {
  initializeBalanceContract,
  getBalances,
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
import { getQueryData, getAllQueryData } from "./queryActions";
import { store } from "../../config/reduxStore";
import { trunc } from "../../utils/utilFunc";
import { utils } from "ethers";

export const _getTokenPrice = _.memoize(async () => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${Object.values(
      CONSTANTS.MAINNET_ADDRESSES
    ).join(",")}&vs_currencies=USD`
  );
  return response;
});

const {
  flashstake: { selectedRewardToken },
} = store.getState();

export const _getFPY = _.memoize(async () => {
  // const {
  //   flashStake: {
  //     initialValues: { quantity },
  //   },
  // } = store.getState();

  await initializeFlashProtocolContract();
  const _fpy = await getFPY();
  return _fpy;
});

export const _getAPYStake = _.memoize(async (_pool, _xpy) => {
  await initializeFlashstakePoolContract(_pool);
  const _apyStake = utils.formatUnits(
    await getAPYStake(_xpy).toString(),
    selectedRewardToken?.tokenB?.decimal
  );
  return _apyStake;
});

export const updateApyPools = (quantity, poolsParam) => async (
  dispatch,
  getState
) => {
  let _apyAllPools = {};
  let _pools = poolsParam;
  try {
    const {
      user: { pools },
      flashstake: { stakeQty, selectedRewardToken },
    } = await getState();
    if (!_pools) {
      _pools = pools;
    }

    let response = await _getTokenPrice();
    const queryData = await getAllQueryData();

    if (response?.data) {
      const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
      const _zero = JSBI.BigInt("0");
      for (let i = 0; i < _pools.length; i++) {
        const data = queryData[_pools[i].id];
        const _quantity = JSBI.BigInt(
          utils.parseUnits(
            String(stakeQty?.toString() || "1"),
            selectedRewardToken?.tokenB?.decimal
          )
        );
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
        //_fpy0
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
        //apy
        const _lpFee = JSBI.subtract(
          JSBI.BigInt("1000"),
          JSBI.divide(_fpy0, JSBI.BigInt(5e15))
        );
        const _apyStake = Web3.utils.fromWei(
          String(
            JSBI.divide(
              JSBI.multiply(
                JSBI.multiply(_fpy, _lpFee),
                JSBI.BigInt(data.reserveAltAmount)
              ),
              JSBI.add(
                JSBI.multiply(
                  JSBI.BigInt(data.reserveFlashAmount),
                  JSBI.BigInt("1000")
                ),
                JSBI.multiply(_fpy, _lpFee)
              )
            )
          )
        );
        const tokenPrice =
          response.data[CONSTANTS.MAINNET_ADDRESSES[_pools[i].tokenB.symbol]]
            .usd || 0;
        // const _apyStake = await _getAPYStake(_pools[i].id, _fpy);
        _apyAllPools[_pools[i].id] = trunc(
          ((_apyStake * tokenPrice) /
            response.data[CONSTANTS.MAINNET_ADDRESSES.XIO].usd || 0) * 100
        );
      }
    }
  } catch (e) {
    _error("ERROR updateApyPools -> ", e);
  }

  dispatch({
    type: "APY_ALL_POOLS",
    payload: _apyAllPools,
  });
};

export const nativePoolPrice = () => async (dispatch, getState) => {
  const {
    // query: { allPoolsData },
    user: { pools },
  } = getState();
  try {
    let flashPrices = {};

    const poolData = await getAllQueryData();
    let flashPrice;

    Object.keys(poolData).filter((_data) => {
      if (_data === "0xe0de5090961bfb0b251a3d84077bcb6147014976") {
        flashPrice =
          poolData[_data]?.reserveFlashAmount /
          poolData[_data]?.reserveAltAmount;
      }
    });

    // flashPrices[_poolData] =
    // (poolData[_poolData]?.reserveAltAmount /
    //   poolData[_poolData]?.reserveFlashAmount) *
    // flashPrice,

    Object.keys(poolData).map((_poolData) => {
      if (poolData) {
        flashPrices[_poolData] =
          (poolData[_poolData]?.reserveAltAmount /
            poolData[_poolData]?.reserveFlashAmount) *
          flashPrice;
      }
      dispatch({
        type: "NATIVE_PRICE",
        payload: flashPrices,
      });
      // });
    });
  } catch (e) {
    _error("ERROR Native Pool Prices -> ", e);
  }
};

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
      _tokenList = _pools.map((_pool) => _pool.tokenB);
      dispatch(updateApyPools("1", _pools));
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
      payload: [
        { id: CONSTANTS.ADDRESS_XIO_RINKEBY, decimal: 18 },
        ..._tokenList,
      ],
    });
    dispatch(updateAllBalances());
  }
};

const getPercentageUnStaked = async (_stake) => {
  const _queryData = await getQueryData(_stake.pool.id);
  const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
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
  const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
  const _getPercentageUnStaked = await getPercentageUnStaked(_stake);
  return JSBI.subtract(_precision, _getPercentageUnStaked);
};

export const calculateBurnSingleStake = async (_stake) => {
  let _burnAmount = JSBI.BigInt(0);
  const _expiry = parseFloat(_stake.expireAfter);
  const _currentTime = parseFloat(Date.now() / 1000);
  if (_expiry > _currentTime) {
    const _precision = JSBI.BigInt(utils.parseUnits("1", 18));
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
          const {
            id,
            amountIn,
            expireAfter,
            rewardAmount,
            pool: {
              tokenB: { decimal },
            },
          } = _tempData;

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
            stakeAmount: utils.formatUnits(amountIn.toString(), 18),
            rewardAmount: utils.formatUnits(rewardAmount.toString(), decimal),
            expiryTime: parseFloat(expireAfter),
            expired,
            amountAvailable: expired
              ? utils.formatUnits(amountIn.toString(), 18)
              : "0",
            burnAmount: utils.formatUnits(_burnAmount.toString(), 18),
          };
        })
      );
      swapHistory = data.swapHistory.map((_swapHis) => ({
        ..._swapHis,
        swapAmount: utils.formatUnits(
          _swapHis.swapAmount.toString(),
          _swapHis.pool.tokenB.decimal
        ),
        flashReceived: utils.formatUnits(_swapHis.flashReceived.toString(), 18),
      }));
      dispatch({
        type: "USER_DATA",
        payload: {
          ...data,
          expiredTimestamps,
          stakes,
          dappBalance: utils.formatUnits(dappBalance.toString(), 18),
          swapHistory,
          expiredDappBalance: utils.formatUnits(
            expiredDappBalance.toString(),
            18
          ),
          totalBurnAmount: utils.formatUnits(totalBurnAmount.toString(), 18),
          totalBalanceWithBurn: utils.formatUnits(
            String(JSBI.subtract(dappBalance, totalBurnAmount)),
            18
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
  await initializeErc20TokenContract(data);
  const _data = await totalSupply(data);
  return {
    type: "TOTAL_SUPPLY",
    payload: _data,
  };
};
