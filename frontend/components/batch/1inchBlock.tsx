import React, { useContext, useState } from "react"
import Image from "next/image"
import { ArrowDownUp } from "lucide-react"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { Web3Adapter } from '@/lib/web3-adapter'
import { PrivateKeyProviderConnector } from "@1inch/cross-chain-sdk"
import Web3 from "web3"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BlockContext } from "./block.components"
import { use1InchTokens } from "@/hooks/use-1inch-tokens"

const OneInchBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("BlockComponent must be used within a BlockProvider")
  }
  
  const { block, updateBlockField } = context
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id || 1
  const [destinationChain, setDestinationChain] = useState<number>(1)
  
  const { tokens: sourceTokens, isLoading: loadingSourceTokens } = use1InchTokens(chainId)
  const { tokens: destTokens, isLoading: loadingDestTokens } = use1InchTokens(destinationChain)

  const handle1inchSwap = async () => {
    try {
      const rpc = chainId === 56 ? 'https://bsc-rpc.publicnode.com' : 'https://ethereum-rpc.publicnode.com'
      const web3 = new Web3(rpc)
      const web3Adapter = new Web3Adapter(web3)
      const pvd = new PrivateKeyProviderConnector(
        process.env.NEXT_PUBLIC_PRIVATE_KEY || '', 
        web3Adapter
      )

      const sourceToken = sourceTokens?.find(t => t.symbol === block.fromToken)
      const destToken = destTokens?.find(t => t.symbol === block.toToken)

      const pvdData = {
        address: pvd.wallet.address,
        chainId: chainId,
        fromToken: sourceToken?.address,
        toToken: destToken?.address,
        amount: block.amount,
        fromChainId: chainId,
        toChainId: destinationChain
      }

      const res = await fetch('/api/fusionOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pvdData })
      })
      
      const response = await res.json()
      console.log("Fusion Order Response:", response)
    } catch (error) {
      console.error("1inch swap error:", error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm mb-2">Source Chain</p>
          <Select disabled value={chainId.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Source Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Ethereum</SelectItem>
              <SelectItem value="56">BSC</SelectItem>
              <SelectItem value="137">Polygon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2">Destination Chain</p>
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
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Select
            value={block.fromToken}
            onValueChange={(value) => updateBlockField(block.id, { fromToken: value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="From Token" />
            </SelectTrigger>
            <SelectContent>
              {sourceTokens?.map((token) => (
                <SelectItem key={token.address} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={token.logoURI}
                      alt={token.symbol}
                      width={24}
                      height={24}
                    />
                    {token.symbol}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount"
            value={block.amount || ""}
            onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
            className="flex-1"
          />
        </div>

        <div className="flex justify-center">
          <div className="rounded-xl border p-2">
            <ArrowDownUp />
          </div>
        </div>

        <Select
          value={block.toToken}
          onValueChange={(value) => updateBlockField(block.id, { toToken: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="To Token" />
          </SelectTrigger>
          <SelectContent>
            {destTokens?.map((token) => (
              <SelectItem key={token.address} value={token.symbol}>
                <div className="flex items-center gap-2">
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={24}
                    height={24}
                  />
                  {token.symbol}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          onClick={handle1inchSwap}
          disabled={!block.fromToken || !block.toToken || !block.amount}
        >
          Execute 1inch Swap
        </Button>
      </div>
    </div>
  )
}

export default OneInchBlock