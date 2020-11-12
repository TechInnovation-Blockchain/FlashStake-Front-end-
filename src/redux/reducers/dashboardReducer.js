export const dashboardReducer = (
  state = {
    stakedPortals: [],
    dialogStep: "",
    refetch: false,
    withdrawRequest: {
      quantity: 0,
      symbol: "",
    },
    totalBurn: {},
    withdrawTxnHash: "",
    reCalculateExpired: false,
    expanded: false,
    selectedStakes: {},
    isStakesSelected: false,
    stakeStatus: "",
  },
  { type, payload }
) => {
  switch (type) {
    case "STAKED_PORTALS":
      return {
        ...state,
        stakedPortals: payload,
      };
    case "DASHBOARD_DIALOG_STEP":
      return {
        ...state,
        dialogStep: payload,
      };
    case "REFETCH":
      return {
        ...state,
        refetch: payload,
        selectedStakes: {},
        isStakesSelected: false,
      };
    case "WITHDRAW_REQUEST":
      return {
        ...state,
        withdrawRequest: payload,
      };
    case "WITHDRAW_TXN_HASH":
      return {
        ...state,
        withdrawTxnHash: payload,
      };
    case "RECALCULATE":
      return {
        ...state,
        reCalculateExpired: payload,
      };
    case "TOGGLE_ACCORDIAN_EXPANDED":
      return {
        ...state,
        expanded: !state.expanded,
      };
    case "SELECT_STAKE":
      let selectedStakes = {
        ...state.selectedStakes,
        [payload]: !state.selectedStakes[payload],
      };
      return {
        ...state,
        selectedStakes,
        isStakesSelected: Object.values(selectedStakes).find((i) => i),
      };
    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedStakes: {},
        isStakesSelected: false,
      };

    case "SUM_OF_BURN":
      return {
        ...state,
        totalBurn: payload,
      };
    case "STAKE_STATUS":
      return {
        ...state,
        stakeStatus: payload,
      };
    default:
      return state;
  }
};
