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
      swapHistory(orderBy: initiationTimestamp, orderDirection: desc) {
        pool {
          tokenB {
            symbol
          }
        }
        swapAmount
        xioReceived
        initiationTimestamp
      }
      stakes(
        where: { active: true }
        orderBy: initiationTimestamp
        orderDirection: desc
      ) {
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
