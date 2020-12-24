import { CONSTANTS } from "../../utils/constants";

export const contractReducer = (
  state = {
    contractState: false,
    // tokenList: [{ id: CONSTANTS.ADDRESS_XIO_RINKEBY, decimal: 18 }],
    tokenList: [],
    oneDay: 60,
  },
  { type, payload }
) => {
  switch (type) {
    case "ADD_TO_TOKEN_LIST":
      return {
        ...state,
        tokenList: [...state.tokenList, payload],
      };
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
    case "ONE_DAY":
      return {
        ...state,
        oneDay: payload,
      };
    default:
      return state;
  }
};
