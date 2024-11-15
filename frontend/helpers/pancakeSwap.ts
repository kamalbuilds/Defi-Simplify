import { CurrencyAmount, ERC20Token, TradeType } from "@pancakeswap/sdk"
import { SmartRouter } from "@pancakeswap/smart-router"
import { ethers } from "ethers"
import { GraphQLClient } from "graphql-request"
import { createPublicClient, http } from "viem"
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

export const fetchPancakeSwapRoute = async ({
  swapFrom,
  swapTo,
  amount,
}: {
  swapFrom: ERC20Token
  swapTo: ERC20Token
  amount: string
}) => {
  try {
    const updatedAmount = CurrencyAmount.fromRawAmount(swapFrom, amount)
    const [v2Pools, v3Pools] = await Promise.all([
      SmartRouter.getV2CandidatePools({
        onChainProvider: () => publicClient,
        v2SubgraphProvider: () => v2SubgraphClient,
        v3SubgraphProvider: () => v3SubgraphClient,
        currencyA: updatedAmount.currency,
        currencyB: swapTo,
      }),
      SmartRouter.getV3CandidatePools({
        onChainProvider: () => publicClient,
        subgraphProvider: () => v3SubgraphClient,
        currencyA: updatedAmount.currency,
        currencyB: swapTo,
        subgraphFallback: false,
      }),
    ])
    const pools = [...v2Pools, ...v3Pools]
    console.log("Pools", pools)
    const trade = await SmartRouter.getBestTrade(
      updatedAmount,
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
  } catch (error) {
    console.log("Error", error)
    return null
  }
}
