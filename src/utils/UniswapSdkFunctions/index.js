import Web3 from "web3";
import {
  initializeErc20TokenInfuraContract,
  symbol,
  decimals,
} from "../contractFunctions/erc20TokenContractFunctions";
import {
  ChainId,
  Token,
  Pair,
  TokenAmount,
  Route,
  Trade,
  TradeType,
} from "@uniswap/sdk";
import { uniswapV2PairContract } from "../../contracts/getContract";
import { CONSTANTS } from "../constants";
import { useMemo } from "react";

let web3js;
let routeTokenAToWeth;
let routeWethToTokenB;
let initializedTokenBAdd = false;

try {
  web3js = new Web3(
    new Web3.providers.HttpProvider(CONSTANTS.INFURA_PROJECT_ENDPOINT_URL)
  );
} catch (e) {
  _error("ERROR web3 -> ", e);
}

export const isAddress = (address) => {
  try {
    return Web3.utils.isAddress(address, ChainId.RINKEBY);
  } catch (e) {
    _error("ERROR isAddress -> ", e);
  }
};

export const isContract = async (address) => {
  try {
    const code = await web3js.eth.getCode(address);
    return code !== "0x";
  } catch (e) {
    _error("ERROR getContract -> ", e);
  }
};

export const getToken = async (address) => {
  try {
    initializeErc20TokenInfuraContract(address);
    const _decimals = await decimals();
    const _symbol = await symbol();
    return new Token(ChainId.RINKEBY, address, _decimals, _symbol);
  } catch (e) {
    _error("ERROR getToken -> ", e);
  }
};

export const getPair = async (token0Address, token1Address) => {
  try {
    const token0 = await getToken(token0Address);
    const token1 = await getToken(token1Address);
    //check if pair exist
    const pairAddress = await Pair.getAddress(token0, token1);
    const pairExists = await isContract(pairAddress);
    if (pairExists) {
      //fetch token reserves from uniswap pair contract
      const pairContract = uniswapV2PairContract(pairAddress);
      const {
        reserve0,
        reserve1,
      } = await pairContract.methods.getReserves().call();
      return new Pair(
        new TokenAmount(token0, reserve0),
        new TokenAmount(token1, reserve1)
      );
    } else {
      return;
    }
  } catch (e) {
    _error("ERROR getPair -> ", e);
  }
};

export const getRoute = async (uniswapPair) => {
  try {
    return new Route([uniswapPair], uniswapPair.token0);
  } catch (e) {
    _error("ERROR getRoute -> ", e);
  }
};

export const getTrade = async (
  uniswapRoute,
  token0Amount = 1000000000000000000
) => {
  try {
    const pair = uniswapRoute.pairs[0];
    const token0 = pair.token0;
    return new Trade(
      uniswapRoute,
      new TokenAmount(token0, token0Amount),
      TradeType.EXACT_INPUT
    );
  } catch (e) {
    _error("ERROR getTrade -> ", e);
  }
};

export const getExecutionPrice = async (uniswapTrade) => {
  try {
    return uniswapTrade.executionPrice;
  } catch (e) {
    _error("ERROR getExecutionPrice -> ", e);
  }
};

export const initializeTrade = async (tokenAAddress, tokenBAddress) => {
  const { WETH_ERC20_ADDRESS } = CONSTANTS;
  routeTokenAToWeth = await getRoute(
    await getPair(tokenAAddress, WETH_ERC20_ADDRESS)
  );
  routeWethToTokenB = await getRoute(
    await getPair(WETH_ERC20_ADDRESS, tokenBAddress)
  );
  initializedTokenBAdd = tokenBAddress;
};

export const getExecutionPriceUsingAddresses = async (
  route,
  tokenAQuantity = 1000000000000000000
) => {
  try {
    const _uniswapTrade = await getTrade(route, tokenAQuantity);
    const _uniswapExecutionPrice = await getExecutionPrice(_uniswapTrade);
    return _uniswapExecutionPrice.toSignificant(18);
  } catch (e) {
    _error("ERROR getExecutionPriceUsingAddresses -> ", e);
  }
};

export const getTokenAToWETHToTokenBPrice = async (
  tokenAQuantity = 1,
  tokenBAdd,
  reinitialize = false
) => {
  try {
    if (initializedTokenBAdd !== tokenBAdd || reinitialize) {
      await initializeTrade(CONSTANTS.ADDRESS_XIO_RINKEBY, tokenBAdd);
    }
    const _tokenAToWethPrice = await getExecutionPriceUsingAddresses(
      routeTokenAToWeth,
      Web3.utils.toWei(parseFloat(tokenAQuantity).toFixed(18).toString())
    );
    const _wethToTokenBPrice = await getExecutionPriceUsingAddresses(
      routeWethToTokenB,
      Web3.utils.toWei(
        parseFloat(_tokenAToWethPrice * tokenAQuantity)
          .toFixed(18)
          .toString()
      )
    );
    return _tokenAToWethPrice * _wethToTokenBPrice;
  } catch (e) {
    _error("ERROR getTokenAToWETHToTokenBPrice -> ", e);
  }
};
