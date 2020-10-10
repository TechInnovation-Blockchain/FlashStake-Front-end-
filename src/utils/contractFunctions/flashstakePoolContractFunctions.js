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
export const getAPYStake = async (_amountIn) => {
  try {
    checkContractInitialized();

    const apy = await infuraContract.methods.getAPYStake(_amountIn).call();
    return apy;
  } catch (e) {
    console.error("ERROR getAPYStake -> ", e);
  }
  return "0";
};

export const getAPYSwap = async (_amountIn) => {
  try {
    checkContractInitialized();

    const apy = await infuraContract.methods.getAPYSwap(_amountIn).call();
    return apy;
  } catch (e) {
    console.error("ERROR getAPYSwap -> ", e);
  }
  return "0";
};
