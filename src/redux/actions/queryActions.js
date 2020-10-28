import { _error } from "../../utils/log";
import { store } from "../../config/reduxStore";
import {
  initializeQueryInfuraContract,
  getReserves,
} from "../../utils/contractFunctions/queryContractFunctions";

export const getQueryData = async (_poolId) => {
  try {
    const { query } = await store.getState();
    if (Date.now() - query.timestamp >= 15000 || query.id !== _poolId) {
      await initializeQueryInfuraContract();
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
