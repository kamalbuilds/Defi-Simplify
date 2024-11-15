"use client"
import { useState, useMemo } from "react"
import { useWeb3 } from "@/hooks/use-web3"
import { useSwapPrice } from "@/hooks/use-swap-price"
import { useSwapExecution } from "@/hooks/use-swap-execution"
import { useTokenBalance } from "@/hooks/use-tokens"
import { tokens } from "@/lib/helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, ArrowDownUp } from "lucide-react"
import { Exchanges } from "@/components/exchanges"
import Image from "next/image"
import PancakeSwap from "./pancakeswap"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { PrivateKeyProviderConnector } from "@1inch/cross-chain-sdk"
import Web3 from "web3"
import { Web3Adapter } from '@/lib/web3-adapter'


export function Swap() {
  const { web3Data } = useWeb3();
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const [amountIn, setAmountIn] = useState("")
  const activeWalletChain = useActiveWalletChain();
  const chainId = activeWalletChain?.id;
  const currentNet = useMemo(() => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet'
        break;
      case 56:
        return "BSC Mainnet"
        break;
      default:
        return "BSC Mainnet"
        break;
    }

  }, [chainId])

  const [trade, setTrade] = useState({
    fromToken: "USDC",
    toToken: "USDT"
  })
  const [showTokenSelect, setShowTokenSelect] = useState<"from" | "to" | null>(null)

  const { data: priceData, isLoading: isPriceLoading } = useSwapPrice(
    trade.fromToken,
    trade.toToken,
    amountIn
  )

  console.log("priceData", priceData)

  const { data: balance } = useTokenBalance(trade.fromToken)
  const { mutate: executeSwap, isPending: isSwapping } = useSwapExecution()


  const handleSwap = () => {
    if (!priceData?.bestExchange || !amountIn) return

    executeSwap({
      fromToken: trade.fromToken,
      toToken: trade.toToken,
      amountIn,
      amountOutMin: (priceData.amountOut * 0.95).toString(),
      exchange: priceData.bestExchange
    })
  }

  const handleTokenSelect = (tokenName: string) => {
    if (showTokenSelect === "from") {
      setTrade(prev => ({ ...prev, fromToken: tokenName }))
    } else {
      setTrade(prev => ({ ...prev, toToken: tokenName }))
    }
    setShowTokenSelect(null)
  }

  const rpc = 'https://bsc-rpc.publicnode.com'

  const web3 = new Web3(rpc)
  const web3Adapter = new Web3Adapter(web3)
  const pvd = new PrivateKeyProviderConnector(
    process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
    web3Adapter
  )
  console.log("Pvd", pvd);

  const handle1inchSwap = async () => {
    try {

      console.log("pvd", pvd);
      // Extract only the necessary data from pvd
      const pvdData = {
        address: pvd.wallet.address,
        chainId: chainId,
      }

      console.log("pvdData", pvdData);

      const res = await fetch('/api/fusionOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pvdData
        })
      })

      const response = await res.json()
      console.log("Response ", response)
    } catch (error) {
      console.error("Swap error:", error)
      throw error
    }
  }

  if (!address) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Please connect your wallet to start swapping
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Button onClick={handle1inchSwap}>1inch swap</Button>
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTokenSelect("from")}
                className="w-[140px]"
              >
                <Image
                  src={tokens[currentNet].find(token => token.name === trade.fromToken)?.image}
                  alt={trade.fromToken}
                  className="mr-2 h-6 w-6"
                />
                {trade.fromToken}
              </Button>
              <Input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTrade(prev => ({
                fromToken: prev.toToken,
                toToken: prev.fromToken
              }))}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTokenSelect("to")}
                className="w-[140px]"
              >
                <Image
                  src={tokens[currentNet].find(token => token.name === trade.toToken)?.image}
                  alt={trade.toToken}
                  className="mr-2 h-6 w-6"
                />
                {trade.toToken}
              </Button>
              <Input
                type="number"
                value={priceData?.amountOut || ""}
                readOnly
                placeholder="Output amount"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          {priceData?.gasPrice && (
            <p className="text-muted-foreground text-sm">
              Estimated Gas: {priceData.gasPrice}
            </p>
          )}
          {balance && (
            <p className="text-muted-foreground text-sm">
              Balance: {balance.toFixed(6)} {trade.fromToken}
            </p>
          )}
          <Button
            className="w-full"
            onClick={handleSwap}
            disabled={isSwapping || !priceData || !amountIn}
          >
            {isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              "Swap"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={!!showTokenSelect} onOpenChange={() => setShowTokenSelect(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {tokens[currentNet]?.map((token, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleTokenSelect(token.name)}
              >
                <Image
                  src={token.image}
                  alt={token.name}
                  className="mr-2 h-6 w-6"
                />
                <span>{token.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <PancakeSwap />

      <div className="mt-8">
        <h3 className="mb-4 text-center text-xl font-semibold">Exchange Rates</h3>
        <Exchanges token0={trade.fromToken} token1={trade.toToken} />
      </div>
    </div>
  )
}