import { combineReducers } from "redux";
import { uiReducer } from "./uiReducer";
import { flashstakeReducer } from "./flashstakeReducer";
import { web3Reducer } from "./web3Reducer";
import { dashboardReducer } from "./dashboardReducer";
import { contractReducer } from "./contractReducer";
import { userReducer } from "./userReducer";
import { txnsReducer } from "./txnsReducer";

export const rootReducer = combineReducers({
  ui: uiReducer,
  flashstake: flashstakeReducer,
  dashboard: dashboardReducer,
  web3: web3Reducer,
  contract: contractReducer,
  user: userReducer,
  txns: txnsReducer,
});
