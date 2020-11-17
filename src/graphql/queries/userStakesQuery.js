import { gql } from "@apollo/client";

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
