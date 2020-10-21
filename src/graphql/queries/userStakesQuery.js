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
        }
        transactionHash
        swapAmount
        xioReceived
        initiationTimestamp
      }
      stakes {
        pool {
          tokenB {
            symbol
          }
        }
        id
        stakeAmount
        rewardAmount
        initiationTimestamp
        expiredTimestamp
        active
        transactionHash
      }
    }
  }
`;
