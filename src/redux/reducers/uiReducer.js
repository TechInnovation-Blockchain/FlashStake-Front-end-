export const uiReducer = (
  state = {
    snackbar: { open: false },
    theme: localStorage.getItem("themeMode") || "dark",
    loading: { dapp: true, themeSwitch: false, walletConnection: false },
    walletBackdrop: false,
  },
  { type, payload }
) => {
  switch (type) {
    case "TOGGLE_THEME_MODE": {
      const themeMode = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("themeMode", themeMode);
      return { ...state, theme: themeMode };
    }
    case "SHOW_SNACKBAR":
      return {
        ...state,
        snackbar: {
          open: true,
          ...payload,
        },
      };
    case "HIDE_SNACKBAR":
      return {
        ...state,
        snackbar: {
          open: false,
        },
      };
    case "LOADING":
      return {
        ...state,
        loading: {
          ...state.loading,
          ...payload,
        },
      };

    case "HIDE_BACKDROP":
      return {
        ...state,
        walletBackdrop: payload,
      };
    default:
      return state;
  }
};
