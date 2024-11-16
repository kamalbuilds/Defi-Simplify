import React, { useContext, useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { bscTokens } from "@pancakeswap/tokens"
import { ArrowDownUp } from "lucide-react"
import { hexToBigInt } from "thirdweb"
import {
  useActiveAccount,
  useActiveWalletChain,
} from "thirdweb/react"
import { bsc } from "thirdweb/chains"
import { IToken, tokens } from "@/config/tokens"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { client } from "@/components/client"
import TokenOutput from "../TokenOutput"
import { executePancakeSwap } from "../pancakeswap/pancakeswap"
import { Button } from "../ui/button"
import { BlockContext } from "./block.components"
import { use1InchTokens } from "@/hooks/use-1inch-tokens"
import { ERC20ABI } from "@/config/ERC20Abi"
import { Contract, ethers } from "ethers"
import { ethers6Adapter } from "thirdweb/adapters/ethers6"
import { handleCheckApprove } from "@/helpers/checkApprove"
import ViewExchanges from "../Exchanges/ViewExchanges"

// Import Pyth SDK for Solidity
import PythAbi from "@pythnetwork/pyth-sdk-solidity/abis/IPyth.json"

const SwapBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("BlockComponent must be used within a BlockProvider")
  }
  const { block, updateBlockField } = context
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id || 1 // Default to Ethereum Mainnet

  const currentNet = useMemo(() => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 56:
        return "BSC Mainnet"
      case 8453:
        return "Base Mainnet"
      default:
        return "Ethereum Mainnet"
    }
  }, [chainId])

  const [loadingTokens, setLoadingTokens] = useState(true)
  const [fetchedTokens, setFetchedTokens] = useState<IToken[]>(
    tokens[currentNet]
  )

  useEffect(() => {
    const fetchTokens = async () => {
      setLoadingTokens(true)
      setFetchedTokens(tokens[currentNet])
      setLoadingTokens(false)
    }
    fetchTokens()
  }, [currentNet])

  const executeBlock = async () => {
    const fromToken = tokens[currentNet].find(
      (t) => t.name === block.fromToken
    )
    const toToken = tokens[currentNet].find((t) => t.name === block.toToken)
    const input = {
      fromToken,
      toToken,
      amount: block.amount,
      amountOut: block.amountout,
      exchange: block.exchangeName,
    }

    if (block.exchangeName === "PancakeSwap") {
      if (!block.amountout) {
        alert("Output amount is not present")
        return
      }
      handlePancakeSwap({
        fromToken: block.fromToken.toLowerCase(),
        toToken: block.toToken.toLowerCase(),
        amount: block.amount,
      })
    }
  }

  const handlePancakeSwap = async ({
    fromToken,
    toToken,
    amount,
  }: {
    fromToken: string
    toToken: string
    amount: string
  }) => {
    if (!activeAccount) return

    try {
      const swapFrom = bscTokens[fromToken as keyof typeof bscTokens]
      const swapTo = bscTokens[toToken as keyof typeof bscTokens]

      const { value, calldata, address: routerAddress } =
        await executePancakeSwap({
          account: activeAccount.address,
          swapTo,
          swapFrom,
          chainId: chainId!,
          amount,
        })

      const ethersSigner = await ethers6Adapter.signer.toEthers({
        client,
        chain: bsc,
        account: activeAccount,
      })
      const contract = new Contract(swapFrom.address, ERC20ABI, ethersSigner)

      const isApproved = await handleCheckApprove({
        activeAccount,
        token: swapFrom,
        routerAddress: routerAddress,
        amount,
        contract,
      })

      if (!isApproved) {
        const amountWithDecimals = ethers.utils.parseUnits(
          amount,
          swapFrom.decimals
        )
        const tx = await contract.approve(routerAddress, amountWithDecimals)
        await activeAccount.sendTransaction(tx)
      }

      const tx = {
        to: routerAddress,
        data: calldata,
        value: hexToBigInt(value),
      }

      await activeAccount.sendTransaction(tx)
    } catch (error) {
      console.log("Error", error)
    }
  }

  const [destinationChain, setDestinationChain] = useState<number>(1)
  const { tokens: sourceTokens } = use1InchTokens(chainId)
  const { tokens: destTokens } = use1InchTokens(destinationChain)

  const handle1InchSwap = async () => {
    if (!block.fromToken || !block.toToken || !block.amount) return

    const sourceToken = sourceTokens?.find(
      (t) => t.symbol === block.fromToken
    )
    const destToken = destTokens?.find((t) => t.symbol === block.toToken)

    try {
      const swapData = {
        fromToken: sourceToken?.address,
        toToken: destToken?.address,
        amount: block.amount,
        fromChainId: chainId,
        toChainId: destinationChain,
        slippage: 1, // 1% default slippage
      }

      // Call your API endpoint that handles 1inch cross-chain swap
      const response = await fetch("/api/1inch-cross-chain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(swapData),
      })

      const result = await response.json()
      // Handle the response...
    } catch (error) {
      console.error("1inch cross-chain swap error:", error)
      throw error
    }
  }

  // State for token price
  const [tokenPrice, setTokenPrice] = useState<number | null>(null)

  useEffect(() => {
    const fetchTokenPrice = async () => {
      console.log("Starting token price fetch for:", block.fromToken)
      if (!block.fromToken) {
        setTokenPrice(null)
        return
      }

      try {
        // Get the token's Pyth price feed ID
        const fromTokenAddress = fetchedTokens.find(
          (token) => token.name === block.fromToken
        )?.address

        console.log("Token Address:", fromTokenAddress)

        const pythPriceId =
          tokenToPythIdMap[fromTokenAddress?.toLowerCase() || ""]

        console.log("Pyth Price ID:", pythPriceId)

        if (!pythPriceId) {
          setTokenPrice(null)
          return
        }

        // Connect to Pyth contract
        const pythContractAddress = pythContractAddresses[chainId]
        if (!pythContractAddress) {
          console.error("Pyth contract not available on this chain.")
          setTokenPrice(null)
          return
        }

        console.log("Pyth Contract Address:", pythContractAddress)

        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        )
        const pythContract = new ethers.Contract(
          pythContractAddress,
          PythAbi,
          provider
        )

        // Fetch price data from the Pyth contract
        const priceData = await pythContract.getPriceNoOlderThan(
          pythPriceId,
          60 // maximum age in seconds
        )

        console.log("Price Data:", priceData)

        const { price, conf, expo } = priceData

        const adjustedPrice = Number(price) * Math.pow(10, expo)
        console.log("Adjusted Price:", adjustedPrice)
        setTokenPrice(adjustedPrice) // Price in USD
      } catch (error) {
        console.error("Error fetching token price:", error)
        setTokenPrice(null)
      }
    }

    fetchTokenPrice()

    const interval = setInterval(fetchTokenPrice, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [block.fromToken, fetchedTokens, chainId])

  if (loadingTokens) {
    return <div>Loading tokens...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Select
          value={destinationChain.toString()}
          onValueChange={(value) => setDestinationChain(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Destination Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Ethereum</SelectItem>
            <SelectItem value="56">BSC</SelectItem>
            <SelectItem value="8453">Base</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex w-full flex-row gap-2">
          <div className="flex-1">
            <Select
              value={block.fromToken}
              onValueChange={(value) => {
                if (fetchedTokens) {
                  updateBlockField(block.id, {
                    fromToken:
                      fetchedTokens.find((token) => token.name === value)?.name ||
                      "",
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="From Token" />
              </SelectTrigger>
              <SelectContent>
                {fetchedTokens.map((token) => (
                  <SelectItem key={token.address} value={token.name}>
                    <div className="flex flex-row gap-2">
                      <Image
                        src={token.image}
                        alt={token.name}
                        className="mr-2 size-6"
                      />
                      {token.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-4">
            <Input
              type="number"
              placeholder="Amount"
              value={block.amount || ""}
              onChange={(e) =>
                updateBlockField(block.id, {
                  amount: e.target.value,
                })
              }
            />
            {tokenPrice !== null && (
              <div>
                <p>Price: ${tokenPrice.toFixed(2)}</p>
                {block.amount && (
                  <p>
                    Total Value: $
                    {(parseFloat(block.amount) * tokenPrice).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-2">
          <ArrowDownUp />
        </div>

        <div className="flex w-full flex-row gap-2">
          <div className="flex-1">
            <Select
              value={block.toToken}
              onValueChange={(value) => {
                updateBlockField(block.id, {
                  toToken:
                    fetchedTokens.find((token) => token.name === value)?.name ||
                    "",
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="To Token" />
              </SelectTrigger>
              <SelectContent>
                {fetchedTokens
                  .filter((token) => token.name !== block.fromToken)
                  .map((token) => (
                    <SelectItem key={token.address} value={token.name}>
                      <div className="flex flex-row gap-2">
                        <Image
                          src={token.image}
                          alt={token.name}
                          className="mr-2 size-6"
                        />
                        {token.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-3">
            {block.fromToken && block.toToken && (
              <TokenOutput
                fromToken={block.fromToken}
                toToken={block.toToken}
              />
            )}
          </div>
        </div>

        {block.fromToken && block.toToken && (
          <ViewExchanges
            fromToken={block.fromToken}
            toToken={block.toToken}
          />
        )}

        <div>
          <Button onClick={executeBlock}>Execute Block</Button>
        </div>
      </div>
    </div>
  )
}

export default SwapBlock

// Mapping of token addresses to Pyth price feed IDs
const tokenToPythIdMap: { [address: string]: string | null } = {
  // Ethereum Mainnet Tokens
  "0xc02aa39b223fe8d0a0e5c4f27ead9083c756cc2":
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // WETH/USD
  "0x6b175474e89094c44da98b954eedeac495271d0f":
    "0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd", // DAI/USD
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48":
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // USDC/USD
  "0xdac17f958d2ee523a2206206994597c13d831ec7":
    "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b", // USDT/USD

  // BSC Mainnet Tokens
  "0xe9e7cea3dedca5984780bafc599bd69add087d56":
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // BUSD/USD
  "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": null, // CAKE/USD not available
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c":
    "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f", // WBNB/USD

  // Base Mainnet Tokens
  "0x4200000000000000000000000000000000000006":
    "0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6", // WETH/USD
  "0xd9f5c86ecb749b442b4e7af615ec3cc4074bc86e":
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", // USDC/USD
}

// Pyth contract addresses for supported chains
const pythContractAddresses: { [chainId: number]: string } = {
  1: "0xff1a0f4744e8582df1e9c9e9618d43cf3a3ef0c4", // Ethereum Mainnet
  56: "0xff1a0f4744e8582df1e9c9e9618d43cf3a3ef0c4", // BSC Mainnet
  8453: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a", // Base Mainnet
}
