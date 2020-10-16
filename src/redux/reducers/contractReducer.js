import { CONSTANTS } from "../../utils/constants";

export const contractReducer = (
  state = {
    contractState: false,
    tokenList: [CONSTANTS.ADDRESS_XIO_RINKEBY],
  },
  { type, payload }
) => {
  switch (type) {
    case "TOKEN_LIST":
      return {
        ...state,
        tokenList: payload,
      };
    case "CONTRACT_STATE":
      return {
        ...state,
        contractState: payload,
      };
    default:
      return state;
  }
};
