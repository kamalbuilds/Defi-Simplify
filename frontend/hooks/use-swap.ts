import { useQuery, useMutation } from "@tanstack/react-query"
import { ethers } from "ethers"
import { tokens, exchanges, exchangesMap } from "@/lib/helpers"
import { useWeb3 } from "@/hooks/use-web3"
import IRouter from "@/lib/artifacts/interfaces/IUniswapV2Router02.json"
import ISwapRouter from "@/lib/artifacts/interfaces/ISwapRouter.json"
import ERC20 from "@/lib/artifacts/interfaces/IERC20.json"

export function useSwap(fromToken: string, toToken: string, amountIn: string) {
  const { web3Data } = useWeb3()
  const currentNet = web3Data?.network || "Ethereum Mainnet"

  const { data: priceData } = useQuery({
    queryKey: ["price", fromToken, toToken, amountIn],
    queryFn: async () => {
      if (!window.ethereum || !amountIn) return null

      const provider = new ethers.BrowserProvider(window.ethereum)
      const decimals = tokens[currentNet][toToken]["decimals"]
      const _tokenIn = tokens[currentNet][fromToken]["address"]
      const _tokenOut = tokens[currentNet][toToken]["address"]
      const path = [_tokenIn, _tokenOut]

      const amount_in = ethers.parseEther(amountIn.toString())
      
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

      const maxPrice = Math.max(...prices)
      const maxPriceIndex = prices.indexOf(maxPrice)

      return {
        amountOut: maxPrice / 10 ** decimals,
        bestExchange: exchangesMap[currentNet][maxPriceIndex]
      }
    },
    enabled: !!amountIn && !!fromToken && !!toToken
  })

  const swapMutation = useMutation({
    mutationFn: async () => {
      if (!window.ethereum || !priceData?.bestExchange) throw new Error("No provider")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()
      const _tokenIn = tokens[currentNet][fromToken]["address"]
      const _tokenOut = tokens[currentNet][toToken]["address"]
      const path = [_tokenIn, _tokenOut]

      const _amountOutMin = priceData.amountOut * 0.95
      const amountOutMin = ethers.parseEther(_amountOutMin.toString())
      const amount_in = ethers.parseEther(amountIn.toString())

      // Approve token
      const erc20Contract = new ethers.Contract(_tokenIn, ERC20.abi, signer)
      const approve_tx = await erc20Contract.approve(priceData.bestExchange.address, amount_in)
      await approve_tx.wait()

      const timestamp = Math.floor(Date.now() / 1000) + 15

      if (priceData.bestExchange.name !== "Uniswap V3") {
        const router = new ethers.Contract(priceData.bestExchange.address, IRouter.abi, signer)
        const swap_tx = await router.swapExactTokensForTokens(
          amount_in,
          amountOutMin,
          path,
          web3Data?.account,
          timestamp
        )
        await swap_tx.wait()
      } else {
        const router = new ethers.Contract(priceData.bestExchange.address, ISwapRouter.abi, signer)
        const params = {
          tokenIn: path[0],
          tokenOut: path[1],
          fee: 3000,
          recipient: web3Data?.account,
          deadline: timestamp,
          amountIn: amount_in,
          amountOutMinimum: amountOutMin,
          sqrtPriceLimitX96: 0
        }
        const swap_tx = await router.exactInputSingle(params)
        await swap_tx.wait()
      }
    }
  })

  return {
    priceData,
    swap: swapMutation.mutate,
    isSwapping: swapMutation.isPending
  }
}