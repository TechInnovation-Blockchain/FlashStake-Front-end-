export const flashstakeReducer = (
  state = {
    factoryAddress: "",
    baseInterestRate: 0,
    portals: [],
    stakeTokens: [],
    rewardTokens: [],
    selectedStakeToken: "XIO",
    selectedRewardToken: "",
    selectedPortal: "",
    allowance: true,
    reward: 0,
    balance: 0,
    dialogStep: "",
    stakeRequest: {
      quantity: 0,
      days: 0,
    },
    stakeTxnHash: "",
    reset: false,
    initialValues: {
      days: "",
      quantity: "",
    },
  },
  { type, payload }
) => {
  switch (type) {
    case "FACTORY_ADDRESS":
      return {
        ...state,
        factoryAddress: payload,
      };
    case "BASE_INTEREST_RATE":
      return {
        ...state,
        baseInterestRate: payload,
      };
    case "PORTALS":
      return {
        ...state,
        portals: payload,
      };
    case "STAKE_TOKENS":
      return {
        ...state,
        stakeTokens: payload,
      };
    case "REWARD_TOKENS":
      return {
        ...state,
        rewardTokens: payload,
      };
    case "SELECTED_STAKE_TOKEN":
      return {
        ...state,
        selectedStakeToken: payload,
      };
    case "SELECTED_REWARD_TOKEN":
      return {
        ...state,
        selectedRewardToken: payload,
      };
    case "SELECTED_PORTAL":
      return {
        ...state,
        selectedPortal: payload,
      };
    case "ALLOWANCE":
      return {
        ...state,
        allowance: payload,
      };
    case "REWARD":
      return {
        ...state,
        reward: payload,
      };
    case "BALANCE":
      return {
        ...state,
        balance: payload,
      };
    case "STAKE_DIALOG_STEP":
      return {
        ...state,
        dialogStep: payload,
      };
    case "STAKE_REQUEST":
      return {
        ...state,
        stakeRequest: payload,
      };
    case "STAKE_TXN_HASH":
      return {
        ...state,
        stakeTxnHash: payload,
      };
    case "RESET":
      return {
        ...state,
        reset: payload,
        selectedPortal: payload ? "" : state.selectedPortal,
        selectedRewardToken: "",
        quantity: "",
        days: "",
      };
    case "INITIAL_VALUES":
      return {
        ...state,
        initialValues: payload,
      };
    default:
      return state;
  }
};
