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

let contract;
let isContractInitialized = false;

export const initializeBalanceContract = async () => {
  contract = balanceContract();
  isContractInitialized = true;
};

export const initializeBalanceInfuraContract = async () => {
  contract = balanceInfuraContract();
  isContractInitialized = true;
};

export const getBalances = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new Error("Wallet not activated.");
      return [{}, 0];
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
    return [_balancesObj, walletBalanceUSD];
  } catch (e) {
    console.error("ERROR getBalances -> ", e);
    return [{}, 0];
  }
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new Error("Balance contract not initialized.");
  }
};
