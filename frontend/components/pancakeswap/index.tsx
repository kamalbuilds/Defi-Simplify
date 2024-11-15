import React, { useCallback, useMemo, useState } from "react"
import {
    ChainId,
    CurrencyAmount,
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

import { Button } from "../ui/button"

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

const PancakeSwap = () => {
    const chainId = 56
    const swapFrom = Native.onChain(chainId)
    const swapTo = bscTokens['usdt']
    // const { address, isConnected } = useAccount()

    console.log("Bsc Tokens", bscTokens)
    console.log("swapTo", swapTo)
    const amount = useMemo(
        () => CurrencyAmount.fromRawAmount(swapFrom, 10 ** 16),
        []
    )
    const [trade, setTrade] = useState<SmartRouterTrade<TradeType> | null>(null)

    const getBestRoute = useCallback(async () => {
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
        console.log("trade >>>", trade);


        setTrade(trade)
    }, [amount])

    const swapCallParams = useMemo(() => {
        if (!trade) {
            return null
        }
        const { value, calldata } = SwapRouter.swapCallParameters(trade, {
            recipient: "0x9452BCAf507CD6547574b78B810a723d8868C85a",
            slippageTolerance: new Percent(1),
        })
        console.log("Value and calldata >>>", value, calldata);

        return {
            address: SMART_ROUTER_ADDRESSES[chainId],
            calldata,
            value,
        }
    }, [trade])

    const swap = useCallback(async () => {
        if (!swapCallParams) {
            return
        }

        const { value, calldata, address: routerAddress } = swapCallParams

        const tx = {
            account: '0x9452BCAf507CD6547574b78B810a723d8868C85a',
            to: routerAddress,
            data: calldata,
            value: hexToBigInt(value),
        }
        console.log("Tx", tx);

        // const gasEstimate = await publicClient.estimateGas(tx)
        // await sendTransactionAsync({
        //   account: address,
        //   chainId,
        //   to: routerAddress,
        //   data: calldata,
        //   value: hexToBigInt(value),
        //   gas: calculateGasMargin(gasEstimate),
        // })
    }, [swapCallParams])


    // const getPools = async () => {
    //     const v3Pools = await V4Router.getV3CandidatePools({
    //         clientProvider: () => client,
    //         currencyA: swapFrom,
    //         currencyB: swapTo,
    //     })
    //     console.log("Pools >>>", v3Pools);

    //     return v3Pools
    // }

    // const fetchBestTradeRoute = async () => {
    //     const routerAddress = SMART_ROUTER_ADDRESSES[ChainId.BSC]

    //     console.log("routerAddress", routerAddress);

    //     const v3Pools = await getPools();
    //     const amount = CurrencyAmount.fromRawAmount(swapFrom, 10 ** 16)

    //     console.log("V3 pools >>>", v3Pools);

    //     const trade = await V4Router.getBestTrade(amount, swapTo, TradeType.EXACT_INPUT, {
    //         gasPriceWei: () => client.getGasPrice(),
    //         candidatePools: v3Pools,
    //     })

    //     console.log("Trade route >>", trade);

    //     // const txn = await

    // }

    return (
        <div>
            {/* <Button onClick={getPools}>Get Pools</Button>
      <Button onClick={fetchBestTradeRoute}>Best Trade</Button> */}

            <p>{!trade ? <button onClick={getBestRoute}>Get Quote</button> : <button onClick={swap}>Swap</button>}</p>

        </div>
    )
}

export default PancakeSwap
