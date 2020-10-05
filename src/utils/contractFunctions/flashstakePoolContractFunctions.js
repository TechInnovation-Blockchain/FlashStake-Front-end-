import Web3 from "web3";

import {
  xioFlashstakePoolContract,
  xioFlashstakePoolInfuraContract,
} from "../../contracts/getContract";

let contract;
let infuraContract;
let isContractInitialized = false;

export const initializeFlashstakePoolContract = (_address) => {
  contract = xioFlashstakePoolContract(_address);
  if (!contract) {
    contract = xioFlashstakePoolInfuraContract(_address);
  }
  infuraContract = xioFlashstakePoolInfuraContract(_address);
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new Error("ERROR Flashstake contract not initialized.");
  }
};
export const getAPY = async (_amountIn, _stake = true) => {
  try {
    checkContractInitialized();

    const apy = await infuraContract.methods.getAPY(_amountIn, _stake).call();
    return apy;
  } catch (e) {
    console.error("ERROR getAPY -> ", e);
  }
  return 0;
};
