import {
  flashProtocolContract,
  flashProtocolInfuraContract,
} from "../../contracts/getContract";
import { _error } from "../log";

let contract;
let isContractInitialized = false;

export const initializeFlashProtocolContract = (_address) => {
  contract = flashProtocolContract(_address);
  if (!contract) {
    contract = flashProtocolInfuraContract(_address);
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ERROR Flash contract not initialized.");
  }
};

export const getOneDay = async () => {
  try {
    checkContractInitialized();

    // const _oneDay = await contract.methods.ONE_DAY().call();
    // // return parseFloat(_oneDay);
    return 60;
  } catch (e) {
    _error("ERROR getOneDay -> ", e);
  }
  return 60;
};
