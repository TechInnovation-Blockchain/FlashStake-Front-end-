import Web3 from "web3";

import { abi as erc20Abi } from "./abi/ERC20Abi.json";
import { abi as FlashStakeProtocolContractAbi } from "./abi/FlashStakeProtocolContractAbi.json";
import { abi as FlashstakePoolAbi } from "./abi/FlashstakePoolAbi.json";
import { abi as BalanceContractAbi } from "./abi/BalanceContract.json";
import { abi as QueryContractAbi } from "./abi/QueryContractAbi.json";
import { abi as FlashProtocolAbi } from "./abi/FlashProtocolAbi.json";

import { CONSTANTS } from "../utils/constants";
import { _error } from "../utils/log";
const {
  FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
  BALANCE_CONTRACT,
  QUERY_CONTRACT,
  FLASH_PROTOCOL_CONTRACT,
} = CONSTANTS;

let web3js;
let web3jsInfura;

try {
  web3jsInfura = new Web3(
    new Web3.providers.HttpProvider(
      // `https://rinkeby.infura.io/v3/`
      `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
      // "http://localhost:3001"
      // "https://ethereum.xio.app:3000"
    )
  );
  console.log("web3jsInfura", web3jsInfura);
  web3js = new Web3(window.web3.currentProvider);
} catch (e) {
  _error("ERROR web3 -> ", e);
}

export const setWeb3Provider = (provider) => {
  web3js = new Web3(provider);
};

export const erc20TokenInfuraContract = (tokenAddress) => {
  try {
    const contract = new web3jsInfura.eth.Contract(erc20Abi, tokenAddress);
    return contract;
  } catch (e) {
    _error("ERROR erc20TokenInfuraContract -> ", e);
  }
};

export const erc20TokenContract = (tokenAddress) => {
  try {
    const contract = new web3js.eth.Contract(erc20Abi, tokenAddress);
    return contract;
  } catch (e) {
    _error("ERROR erc20TokenContract -> ", e);
  }
};

export const xioFlashstakeContract = () => {
  try {
    const contract = new web3js.eth.Contract(
      FlashStakeProtocolContractAbi,
      FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
    );
    return contract;
  } catch (e) {
    _error("ERROR xioFlashstakeContract -> ", e);
  }
};

export const xioFlashstakeInfuraContract = () => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      FlashStakeProtocolContractAbi,
      FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS
    );
    return contract;
  } catch (e) {
    _error("ERROR xioFlashstakeInfuraContract -> ", e);
  }
};

export const xioFlashstakePoolContract = (_poolContractAddress) => {
  try {
    const contract = new web3js.eth.Contract(
      FlashstakePoolAbi,
      _poolContractAddress
    );
    return contract;
  } catch (e) {
    _error("ERROR xioFlashstakePoolContract -> ", e);
  }
};

export const xioFlashstakePoolInfuraContract = (_poolContractAddress) => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      FlashstakePoolAbi,
      _poolContractAddress
    );
    return contract;
  } catch (e) {
    _error("ERROR xioFlashstakePoolInfuraContract -> ", e);
  }
};

export const balanceContract = () => {
  try {
    const contract = new web3js.eth.Contract(
      BalanceContractAbi,
      BALANCE_CONTRACT
    );
    return contract;
  } catch (e) {
    _error("ERROR balanceContract -> ", e);
  }
};

export const balanceInfuraContract = () => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      BalanceContractAbi,
      BALANCE_CONTRACT
    );
    return contract;
  } catch (e) {
    _error("ERROR balanceInfuraContract -> ", e);
  }
};

export const queryContract = () => {
  try {
    const contract = new web3js.eth.Contract(QueryContractAbi, QUERY_CONTRACT);
    return contract;
  } catch (e) {
    _error("ERROR queryContract -> ", e);
  }
};

export const queryInfuraContract = () => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      QueryContractAbi,
      QUERY_CONTRACT
    );
    return contract;
  } catch (e) {
    _error("ERROR queryInfuraContract -> ", e);
  }
};

export const flashProtocolContract = () => {
  try {
    const contract = new web3js.eth.Contract(
      FlashProtocolAbi,
      FLASH_PROTOCOL_CONTRACT
    );
    return contract;
  } catch (e) {
    _error("ERROR queryContract -> ", e);
  }
};

export const flashProtocolInfuraContract = () => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      FlashProtocolAbi,
      FLASH_PROTOCOL_CONTRACT
    );
    return contract;
  } catch (e) {
    _error("ERROR queryInfuraContract -> ", e);
  }
};
