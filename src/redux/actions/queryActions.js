import { _error } from "../../utils/log";
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
    return {};
  }
};

const getReservesDataForced = async () => {
  try {
    const { data } = await axios.get(`${CONSTANTS.CACHE_SERVER}F`);
    return data;
  } catch (e) {
    _error("ERROR getReservesDataForced -> ", e);
    return {};
  }
};

export const getAllQueryDataForced = async () => {
  try {
    const _data = await getReservesDataForced();
    await store.dispatch({
      type: "ALL_POOLS_DATA",
      payload: _data,
    });
    return _data;
  } catch (e) {
    _error("ERROR getAllQueryDataForced -> ", e);
    return {};
  }
};

export const getAllQueryData = async () => {
  try {
    const _data = await getReservesData();
    await store.dispatch({
      type: "ALL_POOLS_DATA",
      payload: _data,
    });
    return _data;
  } catch (e) {
    _error("ERROR updateAllQueryData -> ", e);
    return {};
  }
};

export const getQueryData = async (_poolId, forceRefetchQuery = false) => {
  try {
    const {
      query,
      // poolData
    } = await store.getState();
    if (
      Date.now() - query.timestamp >= 15000 ||
      query.id !== _poolId ||
      forceRefetchQuery
    ) {
      const data = await getReservesData();
      await store.dispatch({
        type: "ALL_POOLS_DATA",
        payload: data,
      });
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
