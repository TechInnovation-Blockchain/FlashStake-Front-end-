import {
  EthToWethConversionContract,
  EthToWethConversionInfuraContract,
} from "../../contracts/getContract";
import { getWalletAddressReduxState } from "../../redux/state";
import { _error, _log } from "../log";

let contract;
let isContractInitialized = false;

export const initializeEthToWethContract = async (address) => {
  contract = EthToWethConversionContract(address);
  if (!contract) {
    contract = EthToWethConversionInfuraContract(address);
  }
  isContractInitialized = true;
};

const checkContractInitialized = () => {
  if (!isContractInitialized) {
    throw new _error("ETH conversion contract not initialized.");
  }
};

export const deposit = async () => {
  try {
    checkContractInitialized();
    const walletAddress = getWalletAddressReduxState();
    if (!walletAddress) {
      // throw new _error("Wallet not activated.");
      return "0";
    }
    console.log("In here", contract.methods);
    const receivedWeth = await contract.methods.deposit().send({
      value: 1000000000000000,
      from: walletAddress,
    });

    // receivedWeth
    return receivedWeth;
  } catch (e) {
    _error("ERROR deposit -> ", e);
    return "0";
  }
};
