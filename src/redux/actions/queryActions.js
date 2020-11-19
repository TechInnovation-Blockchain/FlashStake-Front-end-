import { _error, _log } from "../../utils/log";
import { store } from "../../config/reduxStore";
import axios from "axios";
import { CONSTANTS } from "../../utils/constants";
// import {
// initializeQueryContract,
//   getReserves,
// } from "../../utils/contractFunctions/queryContractFunctions";

const getReservesData = async () => {
  try {
    const { data } = await axios.get(CONSTANTS.CACHE_SERVER);
    return data;
  } catch (e) {
    _error("ERROR getReservesData -> ", e);
  }
};

export const getQueryData = async (_poolId) => {
  try {
    const {
      query,
      // poolData
    } = await store.getState();
    if (Date.now() - query.timestamp >= 15000 || query.id !== _poolId) {
      const data = await getReservesData();
      await store.dispatch({
        type: "QUERY_DATA",
        payload: { id: _poolId, ...data[_poolId] },
      });
      return data[_poolId];
    } else {
      return query;
    }
  } catch (e) {
    _error("ERROR getQueryData -> ", e);
    return {};
  }
};
