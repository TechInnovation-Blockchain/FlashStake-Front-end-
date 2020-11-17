import { gql } from "@apollo/client";
import { isAddress } from "../../utils/UniswapSdkFunctions/index";

export const userStakesQuery = gql`
  query UserStakes($account: String!) {
    protocols {
      id
      pools {
        id
        tokenB {
          id
          symbol
        }
      }
    }
    user(id: $account) {
      id
      swapHistory {
        id
        pool {
          tokenB {
            symbol
          }
          transactionHash
        }
      }
      stakes {
        id
        amountIn
        expiry
        expireAfter
        mintedAmount
        rewardAmount
        staker
        receiver
        active
        transactionHash
        pool {
          id
          tokenB {
            id
            symbol
          }
        }
      }
      stakeHistory {
        id
        amountIn
        expiry
        expireAfter
        mintedAmount
        rewardAmount
        staker
        receiver
        transactionHash
        pool {
          id
          tokenB {
            id
            symbol
          }
        }
      }
      swapHistory {
        id
        swapAmount
        flashReceived
        pool {
          id
          tokenA {
            symbol
          }
          tokenB {
            symbol
          }
          transactionHash
        }
        sender
        transactionHash
      }
      liquidity {
        amountFLASH
        amountALT
        liquidity
        sender
        transactionHash
      }
    }
  }
`;
