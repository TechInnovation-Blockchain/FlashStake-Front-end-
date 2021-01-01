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
    close: false,
    btn: 5,
    closeApproval: false,
    clearField: false,
    // tokensURI: {
    //   name: "Default",
    //   uri:
    //     "https://gateway.pinata.cloud/ipfs/QmehgcQBpkFnkNAGfxz22pjm3WG8raVvDwNzEJSDFWDXHo/flash-default-rinkeby.tokenlist.json",
    //   logo:
    //     "https://gateway.pinata.cloud/ipfs/QmUXXHhTpqc53zF1kXkY1MNr7aUFGL11L1bCM9XSFJkDJk/FLASH.png",
    // },
    tokensURI: JSON.parse(localStorage.getItem("tokensURI")) || {
      name: "Flash Default List",
      uri:
        "https://gateway.pinata.cloud/ipfs/QmegBvuMRxTtJpUsnZtJX42FxUimFokAEaCCQUNhGuntBc/flash.tokenlist.json",
      logoURI:
        "https://gateway.pinata.cloud/ipfs/QmWew1cUQQrpQnRuaf4gbKJt3eVWE4NzxFMbxxpDq7uGei",
    },
    // defaultTokenList:[{
    //   name: "Default List",
    //     uri: "tokens.1inch.eth",
    //     logoURI: "https://1inch.exchange/assets/images/logo.png",
    // }],
  },
  { type, payload }
) => {
  switch (type) {
    case "TOGGLE_THEME_MODE": {
      const themeMode = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("themeMode", themeMode);
      return { ...state, theme: themeMode };
    }

    case "TOGGLE_THEME_MODE_RETRO": {
      const themeMode = state.theme === "dark" || "light" ? "retro" : "retro";
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
    case "CLOSE_APPROVAL":
      return {
        ...state,
        closeApproval: payload,
      };

    case "HIDE_BACKDROP":
      return {
        ...state,
        walletBackdrop: payload,
      };
    case "BTN_SELECT":
      return {
        ...state,
        btn: payload,
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
    case "CLEAR_FIELD":
      return {
        ...state,
        clearField: payload,
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

    case "CLOSE_DIALOGUE":
      return {
        ...state,
        close: payload,
      };
    case "SELECT_TOKENS_LIST":
      return {
        ...state,
        tokensURI: payload,
      };

    default:
      return state;
  }
};
