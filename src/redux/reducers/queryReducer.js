export const queryReducer = (
  state = { timestamp: 0, recalcSwap: false, allPoolsData: {} },
  { type, payload }
) => {
  switch (type) {
    case "QUERY_DATA":
      return {
        ...state,
        ...payload,
        timestamp: Date.now(),
      };
    case "RECALC_SWAP":
      return {
        ...state,
        recalcSwap: !state.recalcSwap,
      };
    case "ALL_POOLS_DATA":
      return {
        ...state,
        allPoolsData: payload,
      };
    default:
      return state;
  }
};
