export const userReducer = (
  state = {
    portals: [],
    stakes: [],
    currentStaked: {},
    pools: [],
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
    default:
      return state;
  }
};
