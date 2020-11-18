import {
  queryContract,
  queryInfuraContract,
} from "../../contracts/getContract";
import {
  getWalletAddressReduxState,
  getTokenList,
  getPools,
} from "../../redux/state";
import Web3 from "web3";
import axios from "axios";
import { _error, _log } from "../../utils/log";
import { useState } from "react";
import { store } from "../../config/reduxStore";

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
  const {
    user: { poolData },
  } = store.getState();
  try {
    checkContractInitialized();
    const _reserves = poolData?.data[_pool];
    _log("Reserves -->", _reserves);
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
