import { gql } from "@apollo/client";
import { isAddress } from "../../utils/UniswapSdkFunctions/index";

export const userStakesQuery = gql`
  query UserStakes($account: String!) {
    user(id: $account) {
      id
      swapHistory {
        id
        pool {
          tokenB {
            symbol
            decimal
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
        timestamp
        pool {
          id
          tokenB {
            id
            symbol
            decimal
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
            decimal
          }
          tokenB {
            symbol
            decimal
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

export const protocolsQuery = gql`
  {
    protocols {
      id
      pools {
        id
        tokenB {
          id
          symbol
          decimal
        }
      }
    }
  }
`;

export const tokensQuery = gql`
  {
    pools {
      id
      tokenB {
        id
        symbol
        decimal
      }
    }
  }
`;
