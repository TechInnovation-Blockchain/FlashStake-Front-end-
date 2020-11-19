export const queryReducer = (
  state = { timestamp: 0, recalcSwap: false },
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
    default:
      return state;
  }
};
