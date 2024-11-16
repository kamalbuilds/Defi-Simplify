import React, { useContext } from "react"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { ethers } from "ethers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BlockContext } from "./block.components"
import { cowTokens } from "@/lib/cowtokens"
import { OrderBookApi, OrderQuoteSideKindSell } from "@cowprotocol/cow-sdk"

const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum" },
  { id: 8453, name: "Base" },
]

const CowSwapBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("CowSwapBlock must be used within a BlockProvider")
  }

  const { block, updateBlockField } = context
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id

  const availableTokens = cowTokens.filter(token => token.chainId === (block.fromChain || chainId))
  
  const handleAmountChange = async (amount: string) => {
    updateBlockField(block.id, { amount })
    
    if (!amount || !block.fromToken || !block.toToken) return

    try {
      const fromToken = cowTokens.find(t => t.symbol === block.fromToken && t.chainId === block.fromChain)
      const toToken = cowTokens.find(t => t.symbol === block.toToken && t.chainId === block.fromChain)

      if (!fromToken || !toToken) return

      const orderBookApi = new OrderBookApi({ chainId: block.fromChain, env: "staging" })
      
      const quoteRequest = {
        sellToken: fromToken.address,
        buyToken: toToken.address,
        from: activeAccount?.address,
        receiver: activeAccount?.address,
        sellAmountBeforeFee: ethers.utils.parseUnits(amount, fromToken.decimals).toString(),
        kind: OrderQuoteSideKindSell.SELL,
      }

      const { quote } = await orderBookApi.getQuote(quoteRequest)
      updateBlockField(block.id, { amountout: quote.buyAmount })
    } catch (error) {
      console.error("Error getting quote:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Chain</label>
          <Select
            value={block.fromChain?.toString()}
            onValueChange={(value) => updateBlockField(block.id, { fromChain: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select chain" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      
      </div>

      <div className="space-y-2">
        <label>From Token</label>
        <Select
          value={block.fromToken}
          onValueChange={(value) => updateBlockField(block.id, { fromToken: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.map((token) => (
              <SelectItem key={token.address} value={token.symbol}>
                <div className="flex items-center gap-2">
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol} 
                    className="w-5 h-5 rounded-full"
                  />
                  {token.symbol}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label>To Token</label>
        <Select
          value={block.toToken}
          onValueChange={(value) => updateBlockField(block.id, { toToken: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.map((token) => (
              <SelectItem key={token.address} value={token.symbol}>
                <div className="flex items-center gap-2">
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol} 
                    className="w-5 h-5 rounded-full"
                  />
                  {token.symbol}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label>Amount</label>
        <Input
          type="number"
          value={block.amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      {block.amountout && (
        <div className="p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground">You will receive approximately:</p>
          <p className="text-lg font-bold">
            {ethers.utils.formatUnits(block.amountout || '0', 18)} {block.toToken}
          </p>x
        </div>
      )}
    </div>
  )
}

export default CowSwapBlock