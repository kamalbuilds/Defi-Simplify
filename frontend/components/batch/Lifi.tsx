import { crossChainSwap, getKlasterBalance, initKlasterService } from "@/services/AbstractService"
import React, { useState } from "react"
import { Account } from "thirdweb/dist/types/exports/wallets.native"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KlasterChains } from "@/lib/KlasterChains"
import { SelectLabel } from "@radix-ui/react-select"
import { parseEther } from "viem"

const Lifi = () => {
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [sourceChain, setSourceChain] = useState<string>("")
  const [destinationChain, setDestinationChain] = useState<string>("")
  const [tokenAmount, setTokenAmount] = useState<number>(0)

  const handleSwap = async () => {
    if (!activeAccount || !tokenAmount) return

    await initKlasterService(activeAccount, activeAccount.address)

    const balance = await getKlasterBalance()
    console.log("Current Balance: ", balance)

    const response = await crossChainSwap({
      activeAccount,
      destinationChainId: Number(destinationChain),
      // amount: parseEther(tokenAmount.toString()),
      amount: 200000n,
    })
    console.log("Swap Response: ", response)
  }

  return (
    <div>
      <h1>Token Swap</h1>
      <div className="flex flex-row gap-4">
        <Select onValueChange={(value) => { setSourceChain(value) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {KlasterChains.map((chain) => (
                <SelectItem key={chain.chainId} value={chain.chainId.toString()}>{chain.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => { setDestinationChain(value) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Destination Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {KlasterChains.map((chain) => (
                <SelectItem key={chain.chainId} value={chain.chainId.toString()}>{chain.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Input
        type="number"
        placeholder="Amount"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(Number(e.target.value))}
      />
      <Button onClick={handleSwap}>Swap Tokens</Button>
    </div>
  )
}

export default Lifi