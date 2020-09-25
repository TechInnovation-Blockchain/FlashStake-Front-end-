export const web3Reducer = (state = {}, { type, payload }) => {
  switch (type) {
    case "WEB3_CONTEXT":
      return {
        ...payload,
      };
    default:
      return state;
  }
};
