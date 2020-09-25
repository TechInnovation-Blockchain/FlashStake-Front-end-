export const userReducer = (
  state = {
    portals: [],
    stakes: [],
    currentStaked: {},
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
    default:
      return state;
  }
};
