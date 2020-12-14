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
import { utils } from "ethers";
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
    const {
      flashstake: { selectedRewardToken },
    } = store.getState();

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
      _balancesObj[_token] = utils.formatUnits(
        _balances[index].toString(),
        selectedRewardToken?.tokenB?.decimal
      );
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
      _poolBalanceObj[_pool.id] = utils.formatUnits(
        _poolBalances[index].toString(),
        selectedRewardToken?.tokenB?.decimal
      );
      return null;
    });
    return [_balancesObj, walletBalanceUSD, _poolBalanceObj];
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
