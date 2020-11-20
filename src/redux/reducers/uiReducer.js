export const uiReducer = (
  state = {
    snackbar: { open: false },
    theme: localStorage.getItem("themeMode") || "dark",
    loading: {
      dapp: true,
      themeSwitch: false,
      walletConnection: false,
    },
    walletBackdrop: false,
    expanding: true,
    animation: 0,
    changeApp: false,
    heightVal: "auto",
    falseSelected: true,
  },
  { type, payload }
) => {
  switch (type) {
    case "TOGGLE_THEME_MODE": {
      const themeMode = state.theme === "dark" ? "retro" : "dark";
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

    case "EXPAND_ACCORDION":
      return {
        ...state,
        expanding: payload,
      };

    case "ANIMATION_DIRECTION":
      return {
        ...state,
        animation: payload,
      };
    case "HEIGHT_VALUE":
      return {
        ...state,
        heightVal: payload,
      };

    case "RETRO_THEME":
      return {
        ...state,
        changeApp: payload,
      };

    case "FALSE_SELECTION":
      return {
        ...state,
        falseSelected: payload,
      };

    default:
      return state;
  }
};
