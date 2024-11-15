import React, { useContext } from "react"
import { BlockContext } from "./block.components"
import { useSquid } from "@/hooks/use-squid"
import { SquidSwap } from "./squid/SquidSwap"
import { SquidLend } from "./squid/SquidLend"
import { ActionSelect } from "./squid/ActionSelect"
import { Button } from "@/components/ui/button"
import { useActiveAccount } from "thirdweb/react"
import { encodeLendingData } from "@/utils/lending"
import { SeraphPurchaseAction } from "./squid/SeraphPurchaseAction"

const SquidBlock = () => {
  const context = useContext(BlockContext)
  const activeAccount = useActiveAccount()
  const { block, updateBlockField } = context
  const { executeSquidRoute, loading } = useSquid()

  const handleSquidAction = async () => {
    try {
      const params = {
        fromAddress: activeAccount?.address,
        fromChain: block.fromChain,
        fromToken: block.fromToken,
        fromAmount: block.amount,
        toChain: block.toChain,
        toToken: block.toToken,
        toAddress: activeAccount?.address,
        slippage: block.slippage || 1,
        enableBoost: true,
        ...(block.actionType === "lend" && {
          postHooks: {
            chainType: "EVM",
            calls: [
              {
                target: block.protocol === "aave" ? AAVE_ADDRESS : RADIANT_ADDRESS,
                callData: encodeLendingData(block),
                value: "0",
                estimatedGas: "500000"
              }
            ]
          }
        })
      }

      const txHash = await executeSquidRoute(params)
      console.log("Transaction executed:", txHash)
    } catch (error) {
      console.error("Squid action error:", error)
    }
  }

  const renderAction = () => {
    switch (block.type) {
      case "swap":
        return <SquidSwap block={block} updateBlockField={updateBlockField} />
      case "buyseraph":
        return <SeraphPurchaseAction block={block} updateBlockField={updateBlockField} />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ActionSelect
        value={block.actionType}
        onChange={(value) => updateBlockField(block.id, { actionType: value })}
      />

      {renderAction()}

      <Button 
        onClick={handleSquidAction}
        disabled={loading}
      >
        {loading ? "Executing..." : "Execute Squid Action"}
      </Button>
    </div>
  )
}

export default SquidBlock