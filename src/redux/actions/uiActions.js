import { store } from "../../config/reduxStore";
import { walletBtnRef } from "../../config/Layout";

export const showSnackbar = (message = "", type = "success") => {
  return {
    type: "SHOW_SNACKBAR",
    payload: { message, type },
  };
};

export const toggleThemeModeAction = () => {
  return {
    type: "TOGGLE_THEME_MODE",
  };
};

export const showSnackbarTxn = (
  message = "",
  type = "success",
  typeT,
  txn,
  noAutoHide = false
) => {
  return {
    type: "SHOW_SNACKBAR",
    payload: { message, type, typeT, txn, noAutoHide },
  };
};

export const hideSnackbar = () => {
  return {
    type: "HIDE_SNACKBAR",
  };
};

export const showSnackbarIndep = (message, type) => {
  store.dispatch(showSnackbar(message, type));
};

export const showSnackbarTxnIndep = (message, type, typeT, txn, noAutoHide) => {
  store.dispatch(showSnackbarTxn(message, type, typeT, txn, noAutoHide));
};

export const setLoading = (data) => {
  return {
    type: "LOADING",
    payload: data,
  };
};

export const showWalletBackdrop = (data) => {
  if (data === true) {
    walletBtnRef.current.scrollIntoView({ behavior: "smooth" });
  }
  return {
    type: "HIDE_BACKDROP",
    payload: data,
  };
};

export const showExpandBox = () => {
  walletBtnRef.current.scrollIntoView({ behavior: "smooth" });
};

export const setLoadingIndep = (data) => {
  store.dispatch(setLoading(data));
};

export const themeSwitchAction = () => async (dispatch) => {
  dispatch(setLoading({ themeSwitch: true }));
  setTimeout(() => dispatch(setLoading({ themeSwitch: false })), 2000);
};
