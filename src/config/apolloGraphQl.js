import { ApolloClient, InMemoryCache } from "@apollo/client";
import { CONSTANTS } from "../utils/constants";

export const client = new ApolloClient({
  uri: CONSTANTS.GRAPHQL_ENDPOINT_URI,
  cache: new InMemoryCache(),
});
