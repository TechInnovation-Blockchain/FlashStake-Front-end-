import { JSBI } from "@uniswap/sdk";
import axios from "axios";
import Web3 from "web3";
import {
  initializeErc20TokenContract,
  balanceOf,
} from "../../utils/contractFunctions/erc20TokenContractFunctions";
import { CONSTANTS } from "../../utils/constants";
import { setLoading } from "./uiActions";
import {
  initializeBalanceInfuraContract,
  getBalances,
} from "../../utils/contractFunctions/balanceContractFunctions";
import {
  getAPYStake,
  initializeFlashstakePoolContract,
} from "../../utils/contractFunctions/flashstakePoolContractFunctions";
import {
  initializeFlashstakeProtocolContract,
  getXPY,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import { getBalanceALT, getBalanceXIO } from "./flashstakeActions";

export const updatePools = (data) => async (dispatch) => {
  let _pools = [];
  let _tokenList = [];
  try {
    if (data?.length) {
      dispatch(setLoading({ dapp: false }));
      _pools = JSON.parse(JSON.stringify(data));
      _tokenList = _pools.map((_pool) => _pool.tokenB.id);
      let response;
      try {
        response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${Object.values(
            CONSTANTS.MAINNET_ADDRESSES
          ).join(",")}&vs_currencies=USD`
        );
      } catch (e) {
        console.error("ERROR pricingAPI -> ", e);
      }
      if (response?.data) {
        initializeFlashstakeProtocolContract();
        const _xpy = await getXPY();
        for (let i = 0; i < _pools.length; i++) {
          initializeFlashstakePoolContract(_pools[i].id);
          _pools[i].apy = Web3.utils.fromWei(await getAPYStake(_xpy));
          _pools[i].tokenPrice =
            response.data[CONSTANTS.MAINNET_ADDRESSES[_pools[i].tokenB.symbol]]
              .usd || 0;
        }
      }
    }
  } catch (e) {
    console.error("ERROR updatePools -> ", e);
  } finally {
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

export const updateUserData = (data) => async (dispatch) => {
  let stakes;
  let swapHistory;
  let expiredTimestamps = [];
  let dappBalance = JSBI.BigInt(0);
  let expiredDappBalance = JSBI.BigInt(0);
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
      dappBalance = JSBI.add(dappBalance, JSBI.BigInt(stakeAmount));
      if (expired) {
        expiredDappBalance = JSBI.add(
          expiredDappBalance,
          JSBI.BigInt(stakeAmount)
        );
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
    swapHistory = data.swapHistory.map((_swapHis) => ({
      ..._swapHis,
      swapAmount: Web3.utils.fromWei(_swapHis.swapAmount),
      xioReceived: Web3.utils.fromWei(_swapHis.xioReceived),
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
      },
    });
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

export const updateAllBalances = () => async (dispatch) => {
  try {
    await initializeBalanceInfuraContract();
    const [_balances, walletBalanceUSD] = await getBalances();
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
    dispatch(getBalanceXIO());
    dispatch(getBalanceALT());
  } catch (e) {
    console.error("ERROR updateAllBalances -> ", e);
  }
};
