"use client"

import { createContext, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react"
import { useActiveWallet, useActiveWalletChain } from "thirdweb/react"

import { BlockType } from "@/types/nav"
import { tokens } from "@/config/tokens"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import BlockComponent from "@/components/batch/block.components"
import { bscTokens } from "@pancakeswap/tokens"
import { hexToBigInt } from "viem"
import { useActiveAccount } from "thirdweb/react"
import { executePancakeSwap } from "@/components/pancakeswap/pancakeswap"
import { usePancakeswapLiquidity } from "@/hooks/use-pancakeswap-liquidity"
import { checkIfBucketExists, handleCreateGreenFieldBucket, handleCreateGreenFieldObject } from "@/helpers/greenFieldFunc"
import { greenfieldTestnet } from "@/utils/chain.utils"
import Spinner from "@/components/Spinner"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"

const defiActions = ["Swap", "Add Liquidity", "Remove Liquidity", "1inch Cross Chain Swap", "Squid Router"]

const BlockContext = createContext<
  | {
    blocks: BlockType[]
    updateBlockField: (id: number, field: string, value: string) => void
  }
  | undefined
>(undefined)

export default function BatchComponent() {
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [nextId, setNextId] = useState(1)

  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id

  const { connector } = useAccount();
  console.log("Connector >>>", connector);
  console.log("chainId >>>", chainId);

  const router = useRouter();
  const wallet = useActiveWallet();

  const currentNet = useMemo(() => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
        break
      case 56:
        return "BSC Mainnet"
        break
      default:
        return "BSC Mainnett"
        break
    }
  }, [chainId]);

  // Add a state to hold the selected tokens
  const [fromToken, setFromToken] = useState<string>("")
  const [toToken, setToToken] = useState<string>("")

  // Update the currentNet effect to set fromToken and toToken
  useEffect(() => {
    if (currentNet === "Ethereum Mainnet") {
      setFromToken(tokens["Ethereum Mainnet"][0].name)
      setToToken(tokens["Ethereum Mainnet"][1].name)
    } else if (currentNet === "BSC Mainnet") {
      setFromToken(tokens["BSC Mainnet"][0].name)
      setToToken(tokens["BSC Mainnet"][1].name)
    }
  }, [currentNet])

  const updateBlockTokens = () => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => ({
        ...block,
        fromToken: fromToken,
        toToken: toToken,
      }))
    )
  }

  useEffect(() => {
    updateBlockTokens()
  }, [fromToken, toToken])

  //   const addBlock = () => {
  //     setBlocks((prevBlocks) => [...prevBlocks, { id: nextId, action: "" }])
  //     setNextId((prevNextId) => prevNextId + 1)
  //   }

  const addBlock = () => {
    setBlocks((prevBlocks) => [
      ...prevBlocks,
      {
        id: nextId,
        action: "",
        fromToken: "",
        toToken: "",
        amount: "0",
        exchangeName: "",
        amountout: 0,
      }, // Ensure all required properties are included
    ])
    setNextId((prevNextId) => prevNextId + 1)
  }

  const deleteBlock = (id: number) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const updateBlockAction = (id: number, action: string) => {
    setBlocks(
      blocks.map((block) => (block.id === id ? { ...block, action } : block))
    )
  }

  const updateBlockField = (
    id: number,
    fields: { [key: string]: string | number }
  ) => {
    setBlocks(
      blocks.map(
        (block) => (block.id === id ? { ...block, ...fields } : block) // Spread the fields into the block
      )
    )
  }

  console.log("Blockss", blocks)

  const activeAccount = useActiveAccount()
  const { addLiquidity, removeLiquidity } = usePancakeswapLiquidity()

  const executeStrategy = () => {
    console.log("Executing strategy:", blocks)
    if (!activeAccount) return

    const executeBlocks = async () => {
      for (const block of blocks) {
        try {
          console.log("Executing block:", block)

          switch (block.action) {
            case "Swap":
              if (!block.fromToken || !block.toToken || !block.amount) {
                throw new Error(`Invalid swap parameters in block ${block.id}`)
              }

              const swapFrom = tokens[currentNet].find(t => t.name === block.fromToken)
              const swapTo = tokens[currentNet].find(t => t.name === block.toToken)

              if (!swapFrom || !swapTo) {
                throw new Error(`Invalid tokens in block ${block.id}`)
              }

              if (block.exchangeName === "PancakeSwap") {
                const {
                  value,
                  calldata,
                  address: routerAddress,
                } = await executePancakeSwap({
                  account: activeAccount.address,
                  swapTo: bscTokens[block.toToken.toLowerCase() as keyof typeof bscTokens],
                  swapFrom: bscTokens[block.fromToken.toLowerCase() as keyof typeof bscTokens],
                  chainId: chainId!!,
                  amount: block.amount,
                })

                const tx = {
                  to: routerAddress,
                  data: calldata,
                  value: hexToBigInt(value),
                }

                await activeAccount?.sendTransaction(tx)
              }
              break

            case "Add Liquidity":
              if (!block.fromToken || !block.toToken || !block.amount) {
                throw new Error(`Invalid liquidity parameters in block ${block.id}`)
              }

              const slippagePercent = 0.005
              const amountAMin = (parseFloat(block.amount) * (1 - slippagePercent)).toString()
              const amountBMin = (parseFloat(block.amountout?.toString() || "0") * (1 - slippagePercent)).toString()

              await addLiquidity({
                tokenA: block.fromToken,
                tokenB: block.toToken,
                amountADesired: block.amount,
                amountBDesired: block.amountout?.toString() || "0",
                amountAMin,
                amountBMin,
                currentNet
              })

              break

            case "Remove Liquidity":
              if (!block.fromToken || !block.toToken || !block.amount) {
                throw new Error(`Invalid remove liquidity parameters in block ${block.id}`)
              }

              // const removeLiquiditySlippage = 0.005 // 0.5%
              // const removeAmountAMin = (parseFloat(block.amount) * (1 - removeLiquiditySlippage)).toString()
              // const removeAmountBMin = (parseFloat(block.amount) * (1 - removeLiquiditySlippage)).toString()

              const removeAmountAMin = '0'
              const removeAmountBMin = '0'

              await removeLiquidity({
                tokenA: block.fromToken,
                tokenB: block.toToken,
                liquidity: block.amount,
                amountAMin: removeAmountAMin,
                amountBMin: removeAmountBMin,
                currentNet
              })
              break

            default:
              throw new Error(`Unknown action "${block.action}" in block ${block.id}`)
          }

          console.log(`Successfully executed block ${block.id}`)
        } catch (error) {
          console.error(`Error executing block ${block.id}:`, error)
          alert(`Error executing block ${block.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          return
        }
      }
    }

    // Start execution
    executeBlocks()
  }

  const deleteLastBlock = () => {
    setBlocks(blocks.slice(0, -1))
  }

  const [strategyName, setStrategyName] = useState('')
  const [savingStrategy, setSavingStrategy] = useState(false);


  const handleSaveStrategy = async () => {
    console.log(activeAccount, strategyName, wallet)
    if (!activeAccount || !strategyName || !wallet) return;

    setSavingStrategy(true);
    try {

      const bucketName = activeAccount.address.toLowerCase();
      const isBucketAvailable = await checkIfBucketExists({
        bucketName: bucketName
      });

      if (!isBucketAvailable) {
        await handleCreateGreenFieldBucket({
          address: activeAccount.address,
          bucketName: bucketName,
          activeAccount,
          connector,
        });
      }

      const strategyData = [...blocks];
      const jsonString = JSON.stringify(strategyData);
      const jsonBlob = new Blob([jsonString], { type: "application/json" });
      const timestamp = new Date().getTime();
      const fileName = `${strategyName}-${timestamp}.json`;
      const jsonFile = new File([jsonBlob], fileName, { type: "application/json" });

      await handleCreateGreenFieldObject({
        address: activeAccount.address,
        bucketName: bucketName,
        jsonFile: jsonFile,
        strategyName: fileName,
        connector
      });

      alert('Strategy saved successfully!');
      setBlocks([]);
      setStrategyName('');
      router.push('/your-strategy')
    } catch (error) {
      console.error("Error saving strategy:", error);
      alert('Failed to save strategy. Please try again.');
    } finally {
      setSavingStrategy(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">DeFi Strategy Builder</h1>
      <div className="my-4 flex flex-row gap-2 space-x-4">
        <Button onClick={addBlock}>
          <Plus className="mr-2 size-4" />
          Add Block
        </Button>
        <Button onClick={deleteLastBlock} disabled={blocks.length === 0}>
          <Minus className="mr-2 size-4" />
          Delete Block
        </Button>

        <Button onClick={executeStrategy} disabled={blocks.length === 0}>
          Execute Strategy
        </Button>

        <div className="flex flex-row gap-4">
          <Input className="min-w-60" type="text" placeholder="Enter Strategy name" onChange={(e) => {
            setStrategyName(e.target.value)
          }} />
          <Button className="w-full" onClick={handleSaveStrategy} disabled={blocks.length === 0}>
            Save Strategy
          </Button>

        </div>
      </div>
      <div className="relative">
        <div
          id="blocks-container"
          className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {savingStrategy ? (
            <>
              <Spinner />
            </>
          ) : (
            <>
              {blocks.map((block) => (
                <Card key={block.id} className="w-96 max-w-md shrink-0">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Block {block.id}</CardTitle>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteBlock(block.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select
                      value={block.action}
                      onValueChange={(value) => updateBlockAction(block.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a DeFi action" />
                      </SelectTrigger>
                      <SelectContent>
                        {defiActions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <BlockComponent
                      block={block}
                      updateBlockField={updateBlockField}
                      setBlocks={setBlocks}
                    />
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
