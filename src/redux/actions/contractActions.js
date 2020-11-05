import {
  initializeFlashstakeProtocolContract,
  paused,
} from "../../utils/contractFunctions/FlashStakeProtocolContract";
import {
  initializeFlashProtocolContract,
  getOneDay,
} from "../../utils/contractFunctions/flashProtocolContractFunctions";
import { _error } from "../../utils/log";

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

export const updateOneDay = () => async (dispatch) => {
  try {
    await initializeFlashProtocolContract();
    const _oneDay = await getOneDay();
    dispatch({
      type: "ONE_DAY",
      payload: _oneDay,
    });
  } catch (e) {
    _error("ERROR updateOneDay -> ", e);
  }
};
