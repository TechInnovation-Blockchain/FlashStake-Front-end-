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
