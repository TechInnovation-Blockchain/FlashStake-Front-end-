export const storeWeb3Context = (context) => {
  return {
    type: "WEB3_CONTEXT",
    payload: context,
  };
};
