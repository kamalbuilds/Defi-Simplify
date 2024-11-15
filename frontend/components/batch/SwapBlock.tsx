import React, { useContext, useMemo, useState } from "react"
import Image from "next/image"
import { bscTokens } from "@pancakeswap/tokens"
import { ArrowDownUp, Blocks } from "lucide-react"
import { getContract, hexToBigInt } from "thirdweb"
import { useActiveAccount, useActiveWalletChain, useReadContract } from "thirdweb/react"
import { bsc } from 'thirdweb/chains'
import { IToken, tokens } from "@/config/tokens"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { client } from "@/components/client";
import TokenOutput from "../TokenOutput"
import { executePancakeSwap } from "../pancakeswap/pancakeswap"
import { Button } from "../ui/button"
import { BlockContext } from "./block.components"
import { use1InchTokens } from "@/hooks/use-1inch-tokens"
import { ERC20ABI } from "@/config/ERC20Abi"
import { Contract, ethers } from "ethers"
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { handleCheckApprove } from "@/helpers/checkApprove"
import ViewExchanges from "../Exchanges/ViewExchanges"

const SwapBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("BlockComponent must be used within a BlockProvider")
  }
  const { block, updateBlockField } = context
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
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

  console.log("Block Action", block)
  const [loadingTokens, setLoadingTokens] = React.useState(true)
  const [fetchedTokens, setFetchedTokens] = React.useState<IToken[]>(
    tokens["BSC Mainnet"]
  )

  React.useEffect(() => {
    const fetchTokens = async () => {
      setLoadingTokens(true)

      if (currentNet === "Ethereum Mainnet") {
        setFetchedTokens(tokens["Ethereum Mainnet"])
      } else {
        setFetchedTokens(tokens["BSC Mainnet"])
      }
      setLoadingTokens(false)
    }
    fetchTokens()
  }, [currentNet])

  console.log("Blocks >>>>>", block)

  const executeBlock = async () => {
    const fromToken = tokens[currentNet].find((t) => t.name === block.fromToken)
    const toToken = tokens[currentNet].find((t) => t.name === block.toToken)
    const input = {
      fromToken,
      toToken,
      amount: block.amount,
      amountOut: block.amountout,
      exchange: block.exchangeName,
    }

    console.log("Input Swap", input)

    if (block.exchangeName === "PancakeSwap") {
      if (!block.amountout) {
        alert("Output amount is not present")
        return
      }

      console.log("block <><><><><><", block)

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

      console.log("Swap From", swapFrom)
      console.log("Swap To", swapTo)

      const {
        value,
        calldata,
        address: routerAddress,
      } = await executePancakeSwap({
        account: activeAccount.address,
        swapTo,
        swapFrom,
        chainId: chainId!!,
        amount,
      })


      const ethersSigner = await ethers6Adapter.signer.toEthers({
        client,
        chain: bsc,
        account: activeAccount,
      });
      const contract = new Contract(swapFrom.address, ERC20ABI, ethersSigner);

      const isApproved = await handleCheckApprove({
        activeAccount,
        token: swapFrom,
        routerAddress: routerAddress,
        amount,
        contract
      })

      console.log("isApproved", isApproved)

      if (!isApproved) {
        console.log(contract, "contract")
        const amountWithDecimals = ethers.parseUnits(amount, swapFrom.decimals)
        const tx = await contract.approve(routerAddress, amountWithDecimals)
        console.log("Tx", tx);

        await activeAccount.sendTransaction(tx)
      }

      const tx = {
        to: routerAddress,
        data: calldata,
        value: hexToBigInt(value),
      }
      console.log("Tx", tx)

      await activeAccount.sendTransaction(tx)
    } catch (error) {
      console.log("Error", error);

    }
  }

  const [destinationChain, setDestinationChain] = useState<number>(1)
  const { tokens: sourceTokens, isLoading: loadingSourceTokens } = use1InchTokens(chainId)
  const { tokens: destTokens, isLoading: loadingDestTokens } = use1InchTokens(destinationChain)

  const handle1InchSwap = async () => {
    if (!block.fromToken || !block.toToken || !block.amount) return

    const sourceToken = sourceTokens?.find(t => t.symbol === block.fromToken)
    const destToken = destTokens?.find(t => t.symbol === block.toToken)

    try {
      const swapData = {
        fromToken: sourceToken?.address,
        toToken: destToken?.address,
        amount: block.amount,
        fromChainId: chainId,
        toChainId: destinationChain,
        slippage: 1 // 1% default slippage
      }

      // Call your API endpoint that handles 1inch cross-chain swap
      const response = await fetch('/api/1inch-cross-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(swapData)
      })

      const result = await response.json()
      // Handle the response...
    } catch (error) {
      console.error('1inch cross-chain swap error:', error)
      throw error
    }
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
            <SelectItem value="137">Polygon</SelectItem>
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
                  .filter(token => token.name !== block.fromToken)
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
              <TokenOutput fromToken={block.fromToken} toToken={block.toToken} />
            )}
          </div>
        </div>

        {block.fromToken && block.toToken && (
          <ViewExchanges fromToken={block.fromToken} toToken={block.toToken} />
        )}

        <div>
          <Button onClick={executeBlock}>Execute Block</Button>
        </div>
      </div>
    </div>
  )
}

export default SwapBlock
