import Web3 from "web3";

import { abi as xioPublicFactoryAbi } from "./abi/XioPublicFactoryAbi.json";
import { abi as xioPublicPortalAbi } from "./abi/XioPublicPortalAbi.json";
import { abi as erc20Abi } from "./abi/ERC20Abi.json";
import { abi as uniswapv2PairAbi } from "./abi/UniswapV2PairAbi.json";
import { abi as FlashStakeProtocolContractAbi } from "./abi/FlashStakeProtocolContractAbi.json";
import { abi as FlashstakePoolAbi } from "./abi/FlashstakePoolAbi.json";
import { abi as BalanceContractAbi } from "./abi/BalanceContract.json";
// import { abi as xioFlashstakeAbi } from "./abi/XioFlashstakeContract.json";

import { CONSTANTS } from "../utils/constants";
const {
  INFURA_PROJECT_ENDPOINT_URL,
  FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS,
  BALANCE_CONTRACT,
} = CONSTANTS;

let web3js;
let web3jsInfura;

try {
  web3jsInfura = new Web3(
    new Web3.providers.HttpProvider(INFURA_PROJECT_ENDPOINT_URL)
  );
  web3js = new Web3(window.web3.currentProvider);
} catch (e) {
  console.error("ERROR web3 -> ", e);
}

export const setWeb3Provider = (provider) => {
  web3js = new Web3(provider);
};

export const xioPublicFactoryContract = (address) => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      xioPublicFactoryAbi,
      address
    );
    return contract;
  } catch (e) {
    console.error("ERROR xioPublicFactoryContract -> ", e);
  }
};

export const xioPublicPortalContract = (publicPortalContractAddress) => {
  try {
    const contract = new web3js.eth.Contract(
      xioPublicPortalAbi,
      publicPortalContractAddress
    );
    return contract;
  } catch (e) {
    console.error("ERROR xioPublicPortalContract -> ", e);
  }
};

export const erc20TokenInfuraContract = (tokenAddress) => {
  try {
    const contract = new web3jsInfura.eth.Contract(erc20Abi, tokenAddress);
    return contract;
  } catch (e) {
    console.error("ERROR erc20TokenInfuraContract -> ", e);
  }
};

export const erc20TokenContract = (tokenAddress) => {
  try {
    const contract = new web3js.eth.Contract(erc20Abi, tokenAddress);
    return contract;
  } catch (e) {
    console.error("ERROR erc20TokenContract -> ", e);
  }
};

export const uniswapV2PairContract = (pairAddress) => {
  try {
    const contract = new web3jsInfura.eth.Contract(
      uniswapv2PairAbi,
      pairAddress
    );
    return contract;
  } catch (e) {
    console.error("ERROR uniswapV2PairContract -> ", e);
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
    console.error("ERROR xioFlashstakeContract -> ", e);
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
    console.error("ERROR xioFlashstakeInfuraContract -> ", e);
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
    console.error("ERROR xioFlashstakePoolContract -> ", e);
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
    console.error("ERROR xioFlashstakePoolInfuraContract -> ", e);
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
    console.error("ERROR balanceContract -> ", e);
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
    console.error("ERROR balanceInfuraContract -> ", e);
  }
};
