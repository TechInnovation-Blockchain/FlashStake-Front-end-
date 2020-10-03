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
        pool {
          tokenB {
            symbol
          }
        }
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
        initiationTimestamp
        expiredTimestamp
        active
      }
    }
  }
`;
