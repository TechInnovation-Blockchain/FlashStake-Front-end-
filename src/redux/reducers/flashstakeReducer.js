export const flashstakeReducer = (
  state = {
    factoryAddress: "",
    baseInterestRate: 0,
    portals: [],
    stakeTokens: [],
    rewardTokens: [],
    selectedStakeToken: "FLASH",
    selectedRewardToken: {},
    selectedPortal: "",
    allowanceXIO: true,
    allowanceALT: true,
    allowanceXIOPool: true,
    allowanceALTPool: true,
    allowancePoolWithdraw: true,
    selectedWithdrawPool: "",
    reward: "0",
    swapOutput: "0",
    balanceXIO: 0,
    balanceALT: 0,
    balanceUSD: 0,
    dialogStep: "",
    dialogStep2: "",
    dialogStep3: "",
    poolDashboard: [],
    stakeRequest: {
      quantity: 0,
      days: 0,
      poolId: "",
    },
    unstakeRequest: {
      timestamps: [],
      quantity: "0",
    },
    liquidityRequest: {},
    withdrawLiquidityRequest: {},
    stakeTxnHash: "",
    liquidityTxnHash: "",
    withdrawLiquidityTxnHash: "",
    reset: false,
    initialValues: {
      days: "",
      quantity: "",
    },
    swapHist: {
      amount: "",
      token: "",
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
    case "ALLOWANCE_XIO":
      return {
        ...state,
        allowanceXIO: payload,
      };
    case "ALLOWANCE_ALT":
      return {
        ...state,
        allowanceALT: payload,
      };

    case "ALLOWANCE_XIO_POOL":
      return {
        ...state,
        allowanceXIOPool: payload,
      };
    case "ALLOWANCE_ALT_POOL":
      return {
        ...state,
        allowanceALTPool: payload,
      };
    case "ALLOWANCE_POOL_WITHDRAW":
      return {
        ...state,
        allowancePoolWithdraw: payload,
      };
    case "STAKE_REWARD":
      return {
        ...state,
        reward: payload,
      };
    case "SWAP_OUTPUT":
      return {
        ...state,
        swapOutput: payload,
      };

    case "SWAP_REQUEST":
      return {
        ...state,
        swapHist: payload,
      };

    case "BALANCE_XIO":
      return {
        ...state,
        balanceXIO: payload,
      };
    case "BALANCE_ALT":
      return {
        ...state,
        balanceALT: payload,
      };
    case "WALLET_BALANCE_USD":
      return {
        ...state,
        balanceUSD: payload,
      };
    case "STAKE_DIALOG_STEP":
      return {
        ...state,
        dialogStep: payload,
      };
    case "SWAP_DIALOG_STEP":
      return {
        ...state,
        dialogStep2: payload,
      };
    case "POOL_DIALOG_STEP":
      return {
        ...state,
        dialogStep3: payload,
      };
    case "STAKE_REQUEST":
      return {
        ...state,
        stakeRequest: payload,
      };
    case "UNSTAKE_REQUEST":
      return {
        ...state,
        unstakeRequest: payload,
      };
    case "LIQUIDITY_REQUEST":
      return {
        ...state,
        liquidityRequest: payload,
      };
    case "WITHDRAW_LIQUIDITY_REQUEST":
      return {
        ...state,
        withdrawLiquidityRequest: payload,
      };
    case "STAKE_TXN_HASH":
      return {
        ...state,
        stakeTxnHash: payload,
      };
    case "LIQDUIDITY_TXN_HASH":
      return {
        ...state,
        liquidityTxnHash: payload,
      };
    case "WITHDRAW_LIQDUIDITY_TXN_HASH":
      return {
        ...state,
        withdrawLiquidityTxnHash: payload,
      };
    case "POOL_DASHBOARD_DATA":
      return {
        ...state,
        poolDashboard: payload,
      };
    case "SELECT_WITHDRAW_POOL":
      return {
        ...state,
        selectedWithdrawPool: payload,
      };
    // case "RESET":
    //   return {
    //     ...state,
    //     reset: payload,
    //     selectedPortal: payload ? "" : state.selectedPortal,
    //     selectedRewardToken: {},
    //     quantity: "",
    //     days: "",
    //   };
    case "INITIAL_VALUES":
      return {
        ...state,
        initialValues: payload,
      };
    default:
      return state;
  }
};
