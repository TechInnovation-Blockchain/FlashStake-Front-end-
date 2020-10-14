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
      stakes(where: { active: true }) {
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
      }
    }
  }
`;
