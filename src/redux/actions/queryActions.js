import { _error, _log } from "../../utils/log";
import { store } from "../../config/reduxStore";
import {
  initializeQueryContract,
  getReserves,
} from "../../utils/contractFunctions/queryContractFunctions";

export const getQueryData = async (_poolId) => {
  try {
    const { query, poolData } = await store.getState();
    _log("query Reducer -->", poolData);
    if (Date.now() - query.timestamp >= 15000 || query.id !== _poolId) {
      await initializeQueryContract();
      const payload = await getReserves(_poolId);
      await store.dispatch({
        type: "QUERY_DATA",
        payload,
      });
      return payload;
    } else {
      return query;
    }
  } catch (e) {
    _error("ERROR getQueryData -> ", e);
    return {};
  }
};
