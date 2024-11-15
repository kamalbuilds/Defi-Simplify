import { useActiveAccount } from "thirdweb/react"
import { ChainSelect } from "@/components/ChainSelect"
import { Input } from "@/components/ui/input"
import { SquidQuoteDisplay } from "./SquidQuoteDisplay"

const SERAPH_NFT_ADDRESS = '0xbb3f21dd9b16741e9822392f753d07da4c6b6cd6'

export const SeraphPurchaseAction = ({ block, updateBlockField }) => {
  const activeAccount = useActiveAccount()

  return (
    <div className="flex flex-col gap-4">
      <ChainSelect
        value={block.fromChain}
        onChange={(value) => updateBlockField(block.id, { fromChain: value })}
        label="From Chain"
      />

      <Input
        type="text"
        placeholder="Seraph NFT ID"
        value={block.seraphId || ''}
        onChange={(e) => updateBlockField(block.id, { seraphId: e.target.value })}
      />

      <Input
        type="number"
        placeholder="Amount in ETH"
        value={block.amount || ''}
        onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
      />

      <SquidQuoteDisplay
        fromToken="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        toToken="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
        amount={block.amount}
        fromChain={block.fromChain}
        toChain="1" // Ethereum mainnet
      />
    </div>
  )
}