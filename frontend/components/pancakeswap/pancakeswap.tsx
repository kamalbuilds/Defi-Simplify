import React, { useCallback, useMemo, useState } from "react"
import {
  ChainId,
  CurrencyAmount,
  ERC20Token,
  Native,
  Percent,
  TradeType,
} from "@pancakeswap/sdk"
import {
  SMART_ROUTER_ADDRESSES,
  SmartRouter,
  SmartRouterTrade,
  SwapRouter,
  V4Router,
} from "@pancakeswap/smart-router"
import { bscTokens } from "@pancakeswap/tokens"
import { GraphQLClient } from "graphql-request"
import { createPublicClient, hexToBigInt, http } from "viem"
import { bsc } from "viem/chains"

const publicClient = createPublicClient({
  chain: bsc,
  transport: http("https://bsc-dataseed1.binance.org"),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
    },
  },
})

const v3SubgraphClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc"
)
const v2SubgraphClient = new GraphQLClient(
  "https://proxy-worker-api.pancakeswap.com/bsc-exchange"
)

const quoteProvider = SmartRouter.createQuoteProvider({
  onChainProvider: () => publicClient,
})

const getBestRoute = async ({
  amount,
  swapTo,
}: {
  amount: CurrencyAmount<any>
  swapTo: ERC20Token
}) => {
  const [v2Pools, v3Pools] = await Promise.all([
    SmartRouter.getV2CandidatePools({
      onChainProvider: () => publicClient,
      v2SubgraphProvider: () => v2SubgraphClient,
      v3SubgraphProvider: () => v3SubgraphClient,
      currencyA: amount.currency,
      currencyB: swapTo,
    }),
    SmartRouter.getV3CandidatePools({
      onChainProvider: () => publicClient,
      subgraphProvider: () => v3SubgraphClient,
      currencyA: amount.currency,
      currencyB: swapTo,
      subgraphFallback: false,
    }),
  ])
  const pools = [...v2Pools, ...v3Pools]
  const trade = await SmartRouter.getBestTrade(
    amount,
    swapTo,
    TradeType.EXACT_INPUT,
    {
      gasPriceWei: () => publicClient.getGasPrice(),
      maxHops: 2,
      maxSplits: 2,
      poolProvider: SmartRouter.createStaticPoolProvider(pools),
      quoteProvider,
      quoterOptimization: true,
    }
  )
  console.log("trade >>>", trade)
  return trade
}

const swapCallParams = async ({
  account,
  amount,
  swapTo,
  chainId,
}: {
  account: string
  amount: CurrencyAmount<any>
  swapTo: ERC20Token
  chainId: number
}) => {
  const trade = await getBestRoute({
    amount,
    swapTo,
  })

  const { value, calldata } = SwapRouter.swapCallParameters(trade, {
    recipient: account,
    slippageTolerance: new Percent(1),
  })
  console.log("Value and calldata >>>", value, calldata)

  return {
    address:
      SMART_ROUTER_ADDRESSES[chainId as keyof typeof SMART_ROUTER_ADDRESSES],
    calldata,
    value,
  }
}

export const executePancakeSwap = async ({
  account,
  chainId,
  swapTo,
  amount,
  swapFrom,
}: {
  account: string
  chainId: number
  swapTo: ERC20Token
  swapFrom: ERC20Token
  amount: string
}) => {
  if (!swapCallParams) {
    return
  }

  const amountBigInt = Number(amount) * 10 ** swapFrom.decimals
  const updatedAmount = CurrencyAmount.fromRawAmount(swapFrom, amountBigInt)

  const {
    value,
    calldata,
    address: routerAddress,
  } = await swapCallParams({
    account,
    amount: updatedAmount,
    swapTo,
    chainId,
  })

  console.log("Value calldata and address", value, calldata, routerAddress)

  return {
    value,
    calldata,
    address: routerAddress,
  }
}
