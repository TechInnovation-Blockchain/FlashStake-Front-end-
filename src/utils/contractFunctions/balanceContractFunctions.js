import {
  balanceContract,
  balanceInfuraContract,
} from "../../contracts/getContract";
import {
  getWalletAddressReduxState,
  getTokenList,
  getPools,
} from "../../redux/state";
import Web3 from "web3";
import { _error } from "../log";
import { store } from "../../config/reduxStore";

let contract;
let isContractInitialized = false;

export const initializeBalanceContract = async () => {
  contract = balanceContract();
  if (!contract) {
    contract = balanceInfuraContract();
  }
  isContractInitialized = true;
};

export const getBalances = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return [{}, 0, {}];
    }
    const _tokenList = getTokenList();
    const _pools = getPools();
    const _balances = await contract.methods
      .getBalances(walletAddress, _tokenList)
      .call();
    let _balancesObj = {};
    let walletBalanceUSD = 0;
    _tokenList.map((_token, index) => {
      _balancesObj[_token] = Web3.utils.fromWei(_balances[index]);
      return null;
    });
    _pools.map((_pool) => {
      walletBalanceUSD += _pool.tokenPrice * _balancesObj[_pool.tokenB.id] || 0;
      return null;
    });
    let _poolBalanceObj = {};
    const _poolBalances = await contract.methods
      .getBalances(
        walletAddress,
        _pools.map((_pool) => _pool.id)
      )
      .call();
    _pools.map((_pool, index) => {
      _poolBalanceObj[_pool.id] = Web3.utils.fromWei(_poolBalances[index]);
      return null;
    });
    return [_balancesObj, walletBalanceUSD, _poolBalanceObj];
  } catch (e) {
    _error("ERROR getBalances -> ", e);
    return [{}, 0, {}];
  }
};

export const getPoolBalances = () => async (dispatch) => {
  try {
    console.log("In here");
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return [{}, 0, {}];
    }
    const _tokenList = getTokenList();
    const _pools = getPools();
    let poolID = [];
    _pools.map((pool) => {
      poolID.push(pool.id);
    });
    const _balances = await contract.methods
      .getBalances(walletAddress, poolID)
      .call();

    let balances = {};

    _pools.map((pool, index) => {
      balances[pool.id] = _balances[index];
    });
    console.log(balances);
    let Symbols = {};

    const {
      user: { pools },
    } = store.getState();

    pools.map((pool, index) => {
      Symbols[pool.tokenB.id] = pool.tokenB.symbol;
    });

    console.log("Symbols", Symbols);

    dispatch({
      type: "POOL_ITEMS",
      payload: Symbols,
    });

    dispatch({
      type: "POOL_DATA_BALANCE",
      payload: balances,
    });
  } catch (e) {
    _error("ERROR getBalances -> ", e);
    return [{}, 0, {}];
  }
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("Balance contract not initialized.");
  }
};
