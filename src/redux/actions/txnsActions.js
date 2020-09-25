import { store } from "../../config/reduxStore";

export const addToTxnQueue = (txnHash, type) => {
  return {
    type: "ADD_TXN_QUEUE",
    payload: { hash: txnHash, lastChecked: null, type },
  };
};

export const updateTxnStatus = (txnHash, updates) => {
  return {
    type: "UPDATE_TXN_STATUS",
    payload: { hash: txnHash, updates },
  };
};

export const removeTxnSuccess = (txnHash, updates) => {
  return {
    type: "UPDATE_TXN_STATUS",
    payload: { hash: txnHash, updates },
  };
};

export const addToTxnQueueIndep = (txnHash) => {
  store.dispatch(addToTxnQueue(txnHash));
};
