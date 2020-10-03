export const contractReducer = (
  state = {
    portals: [],
    baseInterestRate: "0",
    maxDays: "0",
    maxStake: "0",
    contractState: false,
  },
  { type, payload }
) => {
  switch (type) {
    case "PORTALS":
      return {
        ...state,
        portals: payload,
      };
    case "BASE_INTEREST_RATE":
      return {
        ...state,
        baseInterestRate: payload,
      };
    case "MAX_DAYS":
      return {
        ...state,
        maxDays: payload,
      };
    case "MAX_STAKE":
      return {
        ...state,
        maxStake: payload,
      };
    // case "CONTRACT_STATE":
    //   return {
    //     ...state,
    //     contractState: payload,
    //   };
    default:
      return state;
  }
};
