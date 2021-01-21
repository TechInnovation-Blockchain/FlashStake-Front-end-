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
import { CONSTANTS } from "../constants";

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
    const _tokenList = [
      { address: CONSTANTS.ADDRESS_XIO_RINKEBY, decimals: 18 },
      ...getTokenList(),
    ].filter(
      (_token) => !_token?.chainId || _token.chainId === CONSTANTS.CHAIN_ID
    );
    const _pools = getPools().filter((_pool) =>
      _tokenList.find(
        (_token) =>
          String(_token.address).toLowerCase() ===
          String(_pool.tokenB.id).toLowerCase()
      )
    );

    const _balances = await contract.methods
      .getBalances(
        walletAddress,
        _tokenList.map((_token) => _token.address)
      )
      .call();

    let _balancesObj = {};
    let walletBalanceUSD = 0;
    _tokenList.map(({ address, decimals }, index) => {
      _balancesObj[String(address).toLowerCase()] = utils.formatUnits(
        _balances[index].toString(),
        decimals || 18
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
        18
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
