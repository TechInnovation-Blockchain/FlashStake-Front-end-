export const queryReducer = (state = { timestamp: 0 }, { type, payload }) => {
  switch (type) {
    case "QUERY_DATA":
      return {
        ...payload,
        timestamp: Date.now(),
      };
    default:
      return state;
  }
};
