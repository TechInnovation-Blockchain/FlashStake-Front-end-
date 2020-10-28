import {
  initializeFlashstakeProtocolContract,
  paused,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";

export const checkContractState = () => async (dispatch) => {
  let contractState = false;
  try {
    initializeFlashstakeProtocolContract();
    contractState = await paused();
  } catch (e) {
    _error("ERROR checkContractState -> ", e);
  }
  dispatch({
    type: "CONTRACT_STATE",
    payload: contractState,
  });
};
