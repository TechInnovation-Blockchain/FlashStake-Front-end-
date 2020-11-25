export const userReducer = (
  state = {
    portals: [],
    stakes: [],
    currentStaked: {},
    pools: [],
    walletBalance: "0",
    walletBalances: {},
    walletBalancesPool: {},
    pooData: {},
    poolDataBalance: {},
    poolItems: {},
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
    case "WALLET_BALANCES_POOL":
      return {
        ...state,
        walletBalancesPool: payload,
      };

    case "POOL_DATA":
      return {
        ...state,
        poolData: payload,
      };
    case "POOL_DATA_BALANCE":
      return {
        ...state,
        poolDataBalance: payload,
      };
    case "POOL_ITEMS":
      return {
        ...state,
        poolItems: payload,
      };
    default:
      return state;
  }
};
