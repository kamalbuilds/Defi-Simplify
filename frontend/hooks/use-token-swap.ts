import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { ethers } from "ethers"
import { tokens } from "@/config/tokens"
import { useWeb3 } from "./use-web3"
import { exchanges } from "@/lib/helpers"

export function useTokenSwap() {
  const { web3Data } = useWeb3()
  const [trade, setTrade] = useState({
    fromToken: "0",
    toToken: "1"
  })
  const [amountIn, setAmountIn] = useState("")

  const currentNet = web3Data?.network || "Ethereum Mainnet"

  const { data: priceData, refetch: refetchPrice } = useQuery({
    queryKey: ["swapPrice", trade.fromToken, trade.toToken, amountIn],
    queryFn: async () => {
      if (!window.ethereum || !amountIn) return null

      const provider = new ethers.BrowserProvider(window.ethereum)
      const decimals = tokens[currentNet][trade.toToken].decimals
      const _tokenIn = tokens[currentNet][trade.fromToken].address
      const _tokenOut = tokens[currentNet][trade.toToken].address
      const path = [_tokenIn, _tokenOut]

      const amount_in = ethers.parseEther(amountIn)

      // Get prices from exchanges
      const prices = await Promise.all(
        exchanges[currentNet].map(async (e) => {
          if (e.name !== "Uniswap V3") {
            const router = new ethers.Contract(e.address, e.router.abi, provider)
            try {
              const amount = await router.getAmountsOut(amount_in, path)
              return Number(amount[1])
            } catch (err) {
              return 0
            }
          } else {
            const quoter = new ethers.Contract(e.address, e.quoter.abi, provider)
            try {
              const amount = await quoter.callStatic.quoteExactInputSingle(
                _tokenIn,
                _tokenOut,
                3000,
                amount_in,
                0
              )
              return Number(amount)
            } catch (err) {
              return 0
            }
          }
        })
      )

      // Get gas estimate
      const params = {
        sellToken: _tokenIn,
        buyToken: _tokenOut,
        sellAmount: amount_in.toString(),
      }
      const response = await fetch(
        `https://api.0x.org/swap/v1/price?${qs.stringify(params)}`
      )
      const swapPriceJSON = await response.json()

      const maxPrice = Math.max(...prices)
      const maxPriceIndex = prices.indexOf(maxPrice)

      return {
        amountOut: maxPrice / 10 ** decimals,
        gasPrice: swapPriceJSON.estimatedGas,
        bestExchange: exchanges[currentNet][maxPriceIndex]
      }
    },
    enabled: !!amountIn && !!web3Data?.account
  })

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!priceData?.bestExchange || !amountIn) throw new Error("Invalid swap parameters")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()

        // Reference original swap function
        ```typescript:front-end/src/components/Swap.js
      startLine: 123
      endLine: 197
      ```
    }
  })

  return {
    trade,
    setTrade,
    amountIn,
    setAmountIn,
    priceData,
    swap: swapMutation.mutate,
    isSwapping: swapMutation.isPending
  }
}