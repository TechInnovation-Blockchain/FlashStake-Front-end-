import {
  initializeFlashstakeContract,
  getRewardTokens,
  baseInterestRate,
  getMaxDays,
  getMaxStake,
  paused,
} from "../../utils/contractFunctions/xioFlashstakeContractFunctions";
import { setLoading } from "./uiActions";

export const loadContractData = () => async (dispatch) => {
  let _portals = [];
  let _interestRate = "0";
  let _maxDays = "0";
  let _maxStake = "0";
  try {
    initializeFlashstakeContract();
    _portals = await getRewardTokens();
    _interestRate = await baseInterestRate();
    _maxDays = await getMaxDays();
    _maxStake = await getMaxStake();
  } catch (e) {
    _portals = [];
    _interestRate = "0";
    _maxDays = "0";
    _maxStake = "0";
    console.error("ERROR loadContractData -> ", e);
  }
  dispatch({
    type: "PORTALS",
    payload: _portals,
  });
  dispatch({
    type: "BASE_INTEREST_RATE",
    payload: _interestRate,
  });
  dispatch({
    type: "MAX_DAYS",
    payload: _maxDays,
  });
  dispatch({
    type: "MAX_STAKE",
    payload: _maxStake,
  });
  dispatch(setLoading({ dapp: false }));
};

export const checkContractState = () => async (dispatch) => {
  let contractState = false;
  try {
    initializeFlashstakeContract();
    contractState = await paused();
  } catch (e) {
    console.error("ERROR checkContractState -> ", e);
  }
  dispatch({
    type: "CONTRACT_STATE",
    payload: contractState,
  });
};
