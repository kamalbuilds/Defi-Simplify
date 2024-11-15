import { useActiveWalletChain } from "thirdweb/react"
import { TokenSelect } from "@/components/TokenSelect"
import { Input } from "@/components/ui/input"
import { useTokens } from "@/hooks/squid-token-select"
import { SquidQuoteDisplay } from "./SquidQuoteDisplay"
import { ChainSelect } from "@/components/ChainSelect"

export const SquidSwap = ({ block, updateBlockField }) => {
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id || 1
  
  const { tokens: sourceTokens, loading: loadingSourceTokens } = useTokens(chainId)
  const { tokens: destTokens, loading: loadingDestTokens } = useTokens(block.toChain || 1)

  if (loadingSourceTokens || loadingDestTokens) {
    return <div>Loading tokens...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ChainSelect
          value={block.fromChain}
          onChange={(value) => updateBlockField(block.id, { fromChain: value })}
          label="From Chain"
        />
        <ChainSelect
          value={block.toChain}
          onChange={(value) => updateBlockField(block.id, { toChain: value })}
          label="To Chain"
        />
      </div>

      <div className="flex items-center gap-4">
        <TokenSelect
          value={block.fromToken}
          onChange={(value) => updateBlockField(block.id, { fromToken: value })}
          label="From Token"
          tokens={sourceTokens}
        />
        <Input
          type="number"
          placeholder="Amount"
          value={block.amount}
          onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
        />
      </div>

      <TokenSelect
        value={block.toToken}
        onChange={(value) => updateBlockField(block.id, { toToken: value })}
        label="To Token"
        tokens={destTokens}
        disabledValue={block.fromToken}
      />

      <SquidQuoteDisplay
        fromToken={block.fromToken}
        toToken={block.toToken}
        amount={block.amount}
        fromChain={block.fromChain}
        toChain={block.toChain}
      />
    </div>
  )
}