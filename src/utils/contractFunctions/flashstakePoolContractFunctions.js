import {
  xioFlashstakePoolContract,
  xioFlashstakePoolInfuraContract,
} from "../../contracts/getContract";
import { _error } from "../log";

let contract;
let isContractInitialized = false;

export const initializeFlashstakePoolContract = (_address) => {
  contract = xioFlashstakePoolContract(_address);
  if (!contract) {
    contract = xioFlashstakePoolInfuraContract(_address);
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ERROR Flashstake contract not initialized.");
  }
};
export const getAPYStake = async (_amountIn) => {
  try {
    checkContractInitialized();

    const apy = await contract.methods.getAPYStake(_amountIn).call();
    return apy;
  } catch (e) {
    _error("ERROR getAPYStake -> ", e);
  }
  return "0";
};

export const getAPYSwap = async (_amountIn) => {
  try {
    checkContractInitialized();

    const apy = await contract.methods.getAPYSwap(_amountIn).call();
    return apy;
  } catch (e) {
    _error("ERROR getAPYSwap -> ", e);
  }
  return "0";
};
