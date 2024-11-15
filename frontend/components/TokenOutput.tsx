import React, { useContext, useMemo } from "react"
import { useActiveWalletChain } from "thirdweb/react"

import { useExchanges } from "@/hooks/use-exchanges"

import { BlockContext } from "./batch/block.components"
import { Input } from "./ui/input"

const TokenOutput = ({
  fromToken,
  toToken,
}: {
  fromToken: string
  toToken: string
}) => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("BlockComponent must be used within a BlockProvider")
  }
  const { block, updateBlockField } = context

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

  const { data: exchanges, isLoading } = useExchanges(fromToken, toToken)
  console.log("Exchanges >>>>", exchanges)

  const updatedAmountOut = useMemo(() => {
    if (!exchanges || exchanges.length === 0) return 0

    const highestExchange = exchanges.reduce((prev, current) => {
      return prev.price > current.price ? prev : current
    })

    console.log("highest highestExchange", highestExchange)

    const highestPrice = highestExchange.price
    const exchangeName = highestExchange.exchange

    console.log("Highest price", highestPrice)
    console.log("Highest exchangeName", exchangeName)

    const finalOutputAmount = highestPrice * Number(block.amount)

    console.log("finalOutputAmount", finalOutputAmount)
    // updateBlockField(block.id, "amountout", finalOutputAmount)
    // updateBlockField(block.id, "exchangeName", exchangeName)

    updateBlockField(block.id, {
      amountout: finalOutputAmount,
      exchangeName: exchangeName,
    })

    return finalOutputAmount
  }, [exchanges, block.amount, block.id])

  return (
    <Input
      type="number"
      placeholder="Estimated Value"
      value={updatedAmountOut || ""}
      readOnly // Make this field read-only
    />
  )
}

export default TokenOutput
