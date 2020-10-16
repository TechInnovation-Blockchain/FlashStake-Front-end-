import { store } from "../../config/reduxStore";

export const getCurrentReduxState = () => {
  const state = store.getState();
  return state;
};

export const getWalletAddressReduxState = () => {
  const {
    web3: { account },
  } = store.getState();
  return account;
};

export const getTokenList = () => {
  const {
    contract: { tokenList },
  } = store.getState();
  return tokenList;
};

export const getPools = () => {
  const {
    user: { pools },
  } = store.getState();
  return pools;
};
