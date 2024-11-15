import { useQuery } from "@tanstack/react-query"
import { ethers } from "ethers"
import { tokens, exchanges, exchangesMap } from "@/lib/helpers"
import { useWeb3 } from "./use-web3"
import qs from "qs"
import { useExchanges } from "./use-exchanges"

interface SwapPrice {
  amountOut: number
  gasPrice: number
  bestExchange: any
}

export function useSwapPrice(fromTokenName: string, toTokenName: string, amountIn: string) {
  const { data: exchangeData } = useExchanges(fromTokenName, toTokenName)
  const { web3Data } = useWeb3()
  const currentNet = web3Data?.network || "Ethereum Mainnet"

  return useQuery<SwapPrice>({
    queryKey: ["swapPrice", fromTokenName, toTokenName, amountIn],
    queryFn: async () => {
      if (!window.ethereum || !amountIn) throw new Error("Invalid input")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const decimals = tokens[currentNet][toTokenName]["decimals"]
      const _tokenIn = tokens[currentNet][fromTokenName]["address"]
      const _tokenOut = tokens[currentNet][toTokenName]["address"]
      const path = [_tokenIn, _tokenOut]

      const amount_in = ethers.parseEther(amountIn)
      
      // Get prices from all exchanges
      const prices = await Promise.all(
        exchangeData.map(async (e) => {
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
        sellAmount: ethers.parseEther(amountIn).toString(),
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
        bestExchange: exchangesMap[currentNet][maxPriceIndex]
      }
    },
    enabled: !!amountIn && !!fromTokenName && !!toTokenName,
    refetchInterval: 10000
  })
}
