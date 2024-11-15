import { useMutation } from "@tanstack/react-query"
import { ethers } from "ethers"
import { tokens } from "@/lib/helpers"
import { useWeb3 } from "./use-web3"
import IRouter from "@/lib/artifacts/interfaces/IUniswapV2Router02.json"
import ISwapRouter from "@/lib/artifacts/interfaces/ISwapRouter.json"
import ERC20 from "@/lib/artifacts/interfaces/IERC20.json"

interface SwapParams {
  fromToken: string
  toToken: string
  amountIn: string
  amountOutMin: string
  exchange: any
}

export function useSwapExecution() {
  const { web3Data } = useWeb3()
  const currentNet = web3Data?.network || "Ethereum Mainnet"

  return useMutation({
    mutationFn: async ({ fromToken, toToken, amountIn, amountOutMin, exchange }: SwapParams) => {
      if (!window.ethereum || !web3Data?.account) throw new Error("No provider")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const _tokenIn = tokens[currentNet][fromToken]["address"]
      const _tokenOut = tokens[currentNet][toToken]["address"]
      const path = [_tokenIn, _tokenOut]

      const amount_in = ethers.parseEther(amountIn)
      const amount_out_min = ethers.parseEther(amountOutMin)

      
      // Approve token
      const erc20Contract = new ethers.Contract(_tokenIn, ERC20.abi, signer)
      const approve_tx = await erc20Contract.approve(exchange.address, amount_in)
      await approve_tx.wait()

      const timestamp = Math.floor(Date.now() / 1000) + 15

      if (exchange.name !== "Uniswap V3") {
        const router = new ethers.Contract(exchange.address, IRouter.abi, signer);
        console.log(router, "router")
        const tx = await router.swapExactTokensForTokens(
          amount_in,
          amount_out_min,
          path,
          web3Data.account,
          timestamp
        )
        await tx.wait()
      } else {
        const router = new ethers.Contract(exchange.address, ISwapRouter.abi, signer)
        const params = {
          tokenIn: path[0],
          tokenOut: path[1],
          fee: 3000,
          recipient: web3Data.account,
          deadline: timestamp,
          amountIn: amount_in,
          amountOutMinimum: amount_out_min,
          sqrtPriceLimitX96: 0
        }
        const tx = await router.exactInputSingle(params)
        await tx.wait()
      }
    }
  })
}