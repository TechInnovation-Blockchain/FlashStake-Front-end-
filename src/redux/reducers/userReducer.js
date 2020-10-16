export const userReducer = (
  state = {
    portals: [],
    stakes: [],
    currentStaked: {},
    pools: [],
    walletBalance: "0",
    walletBalances: {},
  },
  { type, payload }
) => {
  switch (type) {
    case "PORTALS":
      return {
        ...state,
        portals: payload,
      };
    case "STAKES":
      return {
        ...state,
        stakes: payload,
      };
    case "CURRENT_STAKED":
      return {
        ...state,
        currentStaked: payload,
      };
    case "POOL":
      return {
        ...state,
        pools: payload,
      };

    case "USER_DATA":
      return {
        ...state,
        ...payload,
      };
    case "WALLET_BALANCE":
      return {
        ...state,
        walletBalance: payload,
      };
    case "WALLET_BALANCES":
      return {
        ...state,
        walletBalances: payload,
      };
    default:
      return state;
  }
};
