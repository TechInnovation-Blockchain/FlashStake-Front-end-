import { gql } from "@apollo/client";

export const userStakesQuery = gql`
  query UserStakes($account: String!) {
    user(id: $account) {
      id
      stakes(where: { active: true }) {
        id
        stakeAmount
        tokenA
        tokenB
        initialTimestamp
        endTimestamp
        active
      }
      stakeHistory(
        orderBy: initialTimestamp
        orderDirection: desc
        first: 1000
      ) {
        id
        stakeReward
      }
    }
  }
`;
