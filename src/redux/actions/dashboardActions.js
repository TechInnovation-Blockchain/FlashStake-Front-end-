import { store } from "../../config/reduxStore";

export const setDialogStep = (step) => {
  return {
    type: "DASHBOARD_DIALOG_STEP",
    payload: step,
  };
};

export const setDialogStepIndep = (step) => {
  store.dispatch({
    type: "DASHBOARD_DIALOG_STEP",
    payload: step,
  });
};

export const setRefetch = (val) => {
  return {
    type: "REFETCH",
    payload: val,
  };
};

export const setReCalculateExpired = (val) => {
  return {
    type: "RECALCULATE",
    payload: val,
  };
};

export const setRefetchIndep = (val) => {
  store.dispatch(setRefetch(val));
};

export const setWithdrawTxnHash = (val) => {
  return {
    type: "WITHDRAW_TXN_HASH",
    payload: val,
  };
};

export const setWithdrawTxnHashIndep = (val) => {
  store.dispatch(setWithdrawTxnHash(val));
};

export const toggleAccordianExpanded = (val) => {
  return {
    type: "TOGGLE_ACCORDIAN_EXPANDED",
  };
};
export const selectStake = (id) => {
  return {
    type: "SELECT_STAKE",
    payload: id,
  };
};
