import { queryContract } from "../../contracts/getContract";
import { _error } from "../log";

let contract;
let isContractInitialized = false;

export const initializeQueryContract = async () => {
  contract = queryContract();
  if (!contract) {
    contract = queryContract();
  }
  isContractInitialized = true;
};

export const getReserves = async (_pool) => {
  try {
    checkContractInitialized();
    const _reserves = await contract.methods.getReserves(_pool).call();
    return { ..._reserves, id: _pool };
  } catch (e) {
    _error("ERROR getReserves -> ", e);
    return {};
  }
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("Query contract not initialized.");
  }
};
