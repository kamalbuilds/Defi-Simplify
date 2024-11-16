import React, { useContext, useState } from "react"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import Image from "next/image"
import { ArrowDownUp } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { BlockContext } from "./block.components"
import { tokens } from "../../config/tokens"
import { useCCIP } from "@/hooks/use-ccip"
import { Button } from "../ui/button"


const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", selector: "16015286601757825753" },
  { id: 8453, name: "Base", selector: "5790810961207155433" },
  { id: 100, name: "Gnosis", selector: "11155111" },
]

const CCIPBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error("CCIPBlock must be used within a BlockProvider")
  }

  const { block, updateBlockField } = context
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id

  const [destinationChain, setDestinationChain] = useState<string>("")
  const [message, setMessage] = useState<string>("")

  const { sendMessage } = useCCIP();
  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId)
  const availableDestinations = SUPPORTED_CHAINS.filter(chain => chain.id !== chainId)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Source Chain</label>
          <Select disabled value={currentChain?.id.toString()}>
            <SelectTrigger>
              <SelectValue placeholder={currentChain?.name || "Select chain"} />
            </SelectTrigger>
          </Select>
        </div>

        <div className="space-y-2">
          <label>Destination Chain</label>
          <Select
            value={destinationChain}
            onValueChange={(value) => {
              setDestinationChain(value)
              updateBlockField(block.id, { destinationChainSelector: value })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {availableDestinations.map((chain) => (
                <SelectItem key={chain.id} value={chain.selector}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label>Token to Send</label>
        <Select
          value={block.fromToken}
          onValueChange={(value) => updateBlockField(block.id, { fromToken: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {tokens[currentChain?.name || "Ethereum Mainnet"]?.map((token) => (
              <SelectItem key={token.address} value={token.name}>
                <div className="flex items-center gap-2">
                  <Image src={token.image} alt={token.name} width={24} height={24} />
                  {token.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        type="number"
        placeholder="Amount"
        value={block.amount || ""}
        onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
      />

      <Input
        type="text"
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value)
          updateBlockField(block.id, { message: e.target.value })
        }}
      />
      
      <Button onClick={() => sendMessage({
        destinationChainSelector: destinationChain,
        receiver: activeAccount?.address || "",
        token: block.fromToken,
        amount: block.amount,
        message: message
      })}>Send</Button>
    </div>
  )
}

export default CCIPBlock