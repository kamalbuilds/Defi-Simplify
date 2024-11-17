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


const CCIP_SUPPORTED_TOKENS = {
    Ethereum: [
      { name: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", image: "/link.png", decimals: 18 },
      { name: "CCIP-BnM", address: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05", image: "/bnm.png", decimals: 18 },
      { name: "CCIP-LnM", address: "0x466D489b6d36E7E3b824ef491C225F5830E81cC1", image: "/lnm.png", decimals: 18 }
    ],
    Base: [
      { name: "LINK", address: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196", image: "/link.png", decimals: 18 },
      { name: "CCIP-BnM", address: "0xbf9036529123DE264bFA0FC7362fE25B650D4B16", image: "/bnm.png", decimals: 18 },
      { name: "CCIP-LnM", address: "0x73ed16c1a61b098fd6924CCE5cC6a9A30348D944", image: "/lnm.png", decimals: 18 }
    ],
    Gnosis: [
      { name: "LINK", address: "0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2", image: "/link.png", decimals: 18 },
      { name: "CCIP-BnM", address: "0xbf9036529123DE264bFA0FC7362fE25B650D4B16", image: "/bnm.png", decimals: 18 },
      { name: "CCIP-LnM", address: "0x73ed16c1a61b098fd6924CCE5cC6a9A30348D944", image: "/lnm.png", decimals: 18 }
    ]
  }
  
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
  const { sendMessage } = useCCIP()

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId)
  const availableDestinations = SUPPORTED_CHAINS.filter(chain => chain.id !== chainId)

  // Function to switch networks
  const switchNetwork = async (chainId: number) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Source Chain</label>
          <Select 
            value={currentChain?.id.toString()}
            onValueChange={(value) => switchNetwork(parseInt(value))}
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
            {CCIP_SUPPORTED_TOKENS[currentChain?.name || "Ethereum"]?.map((token) => (
              <SelectItem key={token.address} value={token.address}>
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