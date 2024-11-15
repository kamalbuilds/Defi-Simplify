"use client"

import { useMemo } from "react"
import { fetchPancakeSwapRoute } from "@/helpers/pancakeSwap"
import { bscTokens, ethereumTokens } from "@pancakeswap/tokens"
import { useQuery } from "@tanstack/react-query"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"

import { exchanges, tokens } from "@/lib/helpers"
import { useWeb3 } from "@/hooks/use-web3"
import { ethers } from "ethers"
import { ethers6Adapter } from "thirdweb/adapters/ethers6"
import { bsc } from "thirdweb/chains"
import { client } from "@/components/client"

export function useExchanges(fromTokenName: string, toTokenName: string) {
  const { web3Data } = useWeb3()
  const activeWalletChain = useActiveWalletChain()
  const activeAccount = useActiveAccount()
  const chainId = activeWalletChain?.id
  const currentNet = useMemo(() => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
        break
      case 56:
        return "BSC Mainnet"
        break
      default:
        return "BSC Mainnet"
        break
    }
  }, [chainId])

  return useQuery({
    queryKey: ["exchanges", fromTokenName, toTokenName, currentNet],
    queryFn: async () => {
      if (!window.ethereum) throw new Error("No provider")

      const provider = new ethers.BrowserProvider(window.ethereum)

      console.log(
        "tokens[currentNet]",
        tokens[currentNet],
        fromTokenName,
        toTokenName
      )

      const token0 = tokens[currentNet].find((t) => t.name === fromTokenName)
      const token1 = tokens[currentNet].find((t) => t.name === toTokenName)

      console.log("Token 0", token0)
      console.log("Token 1", token1)

      if (!token0 || !token1) throw new Error("Token not found")

      const decimals = token1.decimals
      const amountIn = ethers.parseUnits("1", token0.decimals)

      console.log("Exchanges:", exchanges[currentNet])
      const items = await Promise.all(
        exchanges[currentNet].map(async (e) => {
          console.log("Router address:", e.router)
          const ethersSigner = await ethers6Adapter.signer.toEthers({
            client,
            chain: activeWalletChain!,
            account: activeAccount!,
          });

          const router = new ethers.Contract(
            e.router.address,
            e.router.abi.abi,
            ethersSigner
          )

          console.log("Router:", router)
          console.log("Protocol name", e.name)
          try {
            let amount
            if (e.name === "PancakeSwap") {
              const swapFrom =
                bscTokens[token0.name.toLowerCase() as keyof typeof bscTokens]
              const swapTo =
                bscTokens[token1.name.toLowerCase() as keyof typeof bscTokens]
              console.log("Swap From and TO", swapFrom, swapTo)
              const tradeRoute = await fetchPancakeSwapRoute({
                swapFrom,
                swapTo,
                amount: amountIn.toString(),
              })

              console.log("tradeRoute", tradeRoute)

              if (!tradeRoute) {
                return {
                  exchange: e.name,
                  price: 0,
                }
              }
              console.log(
                "price",
                Number(
                  ethers.formatUnits(
                    tradeRoute.outputAmount.quotient.toString(),
                    decimals
                  )
                )
              ) // Accessing the quotient
              return {
                exchange: e.name,
                price: Number(
                  ethers.formatUnits(
                    tradeRoute.outputAmount.quotient.toString(),
                    decimals
                  )
                ),
              }
            } else if (e.name !== "Uniswap V3") {
              console.log("i m not uniswap v3")
              amount = await router.getAmountsOut(amountIn, [
                token0.address,
                token1.address,
              ])
              console.log(`${e.name} returned:`, amount)
              return {
                exchange: e.name,
                price: Number(ethers.formatUnits(amount[1], decimals)),
              }
            } else {
              console.log("i m uniswap v3")
              const params = {
                tokenIn: token0.address,
                tokenOut: token1.address,
                fee: 3000,
                recipient: web3Data?.account,
                deadline: Math.floor(Date.now() / 1000) + 60 * 20,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0,
              }

              const quoter = new ethers.Contract(
                e.quoter.address,
                e.quoter.abi.abi,
                ethersSigner
              )
              console.log("Quoter:", quoter)

              const amount = await quoter.callStatic.quoteExactInputSingle(
                token0.address,
                token1.address,
                3000,
                amountIn,
                0
              )

              console.log("amount", amount)
              return {
                exchange: e.name,
                price: Number(ethers.formatUnits(amount, decimals)),
              }
            }
          } catch (err) {
            console.error(`Error getting price from ${e.name}:`, {
              error: err,
              router: e.router.address,
              token0: token0.address,
              token1: token1.address,
            })
            return {
              exchange: e.name,
              price: 0,
            }
          }
        })
      )
      return items
    },
    enabled:
      !!window.ethereum &&
      !!fromTokenName &&
      !!toTokenName &&
      !!tokens[currentNet]?.find((t) => t.name === fromTokenName) &&
      !!tokens[currentNet]?.find((t) => t.name === toTokenName),
    // refetchInterval: 30000
    refetchOnWindowFocus: false,
  })
}
