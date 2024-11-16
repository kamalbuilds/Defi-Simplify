import { useActiveWalletChain } from "thirdweb/react"
import { TokenSelect } from "@/components/TokenSelect"
import { Input } from "@/components/ui/input"
import { useTokens } from "@/hooks/squid-token-select"
import { SquidQuoteDisplay } from "./SquidQuoteDisplay"
import { ChainSelect } from "@/components/ChainSelect"
import { useState, useEffect } from "react"
import { PythHttpClient } from "@pythnetwork/client"
import { clusterApiUrl, Connection } from "@solana/web3.js"

export const SquidSwap = ({ block, updateBlockField }) => {
  const activeWalletChain = useActiveWalletChain()
  const chainId = activeWalletChain?.id || 1

  // Map chain IDs to chain names used in your tokens object
  const chainIdToName = {
    1: "Ethereum Mainnet",
    56: "BSC Mainnet",
    // Add other chain IDs and names as needed
  }

  // const chainName = chainIdToName[chainId]
  // const toChainName = chainIdToName[block.toChain] || "Ethereum Mainnet"

  // Get the tokens for the selected chains
  // const sourceTokens = tokenList[chainName] || []
  // const destTokens = tokenList[toChainName] || []

  const [tokenPrice, setTokenPrice] = useState(null)

  useEffect(() => {
    const fetchTokenPrice = async () => {
      if (!block.fromToken) return

      const connection = new Connection(clusterApiUrl("mainnet-beta"))
      const pythClient = new PythHttpClient(connection)

      const data = await pythClient.getData()

      // Map your token to Pyth's product identifier
      const pythProductId = tokenToPythIdMap[block.fromToken]

      if (!pythProductId) {
        setTokenPrice(null)
        return
      }

      const priceInfo = data.productPrice.get(pythProductId)

      if (priceInfo && priceInfo.price) {
        setTokenPrice(priceInfo.price)
      } else {
        setTokenPrice(null)
      }
    }

    fetchTokenPrice()

    const interval = setInterval(fetchTokenPrice, 60000)

    return () => clearInterval(interval)
  }, [block.fromToken])


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
        {tokenPrice !== null && (
          <div>
            <p>Price: ${tokenPrice.toFixed(2)}</p>
            <p>Total Value: ${(block.amount * tokenPrice).toFixed(2)}</p>
          </div>
        )}
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

// Mapping of token addresses to Pyth product IDs
const tokenToPythIdMap = {
  // Ethereum Mainnet Tokens
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // WETH/USD
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "0x2f9e608fd881861b8916257b76613cb23b52f743661787c0f9e1b9f1bdbdce2f", // DAI/USD
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "0xa995d3ec087b9745f8f7d90a0be791237bef7b153b1f9632bb6c0c42e4d0b7e7", // USDC/USD
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": "0xeaa020c61acdf4270eb50016b17b5c75e5cda8df", // USDT/USD
  "0x514910771AF9Ca656af840dff83E8264EcF986CA": "0x9b0fc9502749eebc250d70bb2c0d2e27f9960dc0a6a5a1e1ce3dc7a5b7e6e10b", // LINK/USD
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984": "0x74bf9c139aa7e4a61fdb8fe0b17b46e09ea8f46a1715d77726e7b8d4fe2d3415", // UNI/USD

  // BSC Mainnet Tokens
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": "0xfe650f0367d4a7efcbf8a0bf9f43c3eb48e52c62d71e7d91ff497ed181c12c6b", // BUSD/USD
  "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82": null, // CAKE/USD not available on Pyth
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": "0xe09c8e6f0aefd94d2e6e4844dbb6b81a954e3f90567873e5903e5672b7a4396b", // WBNB/USD
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": "0xa995d3ec087b9745f8f7d90a0be791237bef7b153b1f9632bb6c0c42e4d0b7e7", // USDC/USD (same as Ethereum)
  "0x55d398326f99059fF775485246999027B3197955": "0xeaa020c61acdf4270eb50016b17b5c75e5cda8df", // USDT/USD (same as Ethereum)
}
