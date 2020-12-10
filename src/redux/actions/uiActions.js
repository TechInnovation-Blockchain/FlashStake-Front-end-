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

export const toggleThemeModeActionRetro = () => {
  return {
    type: "TOGGLE_THEME_MODE_RETRO",
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

export const setExpandAccodion = (data) => {
  return {
    type: "EXPAND_ACCORDION",
    payload: data,
  };
};

export const setAnimationDirection = (data) => {
  return {
    type: "ANIMATION_DIRECTION",
    payload: data,
  };
};

export const setHeightValue = (data) => {
  return {
    type: "HEIGHT_VALUE",
    payload: data,
  };
};

export const setRetroTheme = (data) => {
  return {
    type: "RETRO_THEME",
    payload: data,
  };
};

export const setFalseSelected = (data) => {
  return {
    type: "FALSE_SELECTION",
    payload: data,
  };
};
export const setBtn = (data) => {
  return {
    type: "BTN_SELECT",
    payload: data,
  };
};

//

export const themeSwitchAction = () => async (dispatch) => {
  dispatch(setLoading({ themeSwitch: true }));
  setTimeout(() => dispatch(setLoading({ themeSwitch: false })), 2000);
};

export const setClose = (data) => {
  return {
    type: "CLOSE_DIALOGUE",
    payload: data,
  };
};
