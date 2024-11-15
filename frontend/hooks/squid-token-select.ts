import { useState, useEffect } from "react"
import { IToken, tokens } from "@/config/tokens"

export const useTokens = (chainId: number) => {
  const [loading, setLoading] = useState(true)
  const [tokenList, setTokenList] = useState<IToken[]>([])

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true)
      try {
        const networkName = chainId === 1 ? "Ethereum Mainnet" : "BSC Mainnet"
        setTokenList(tokens[networkName])
      } catch (error) {
        console.error("Error fetching tokens:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [chainId])

  return { tokens: tokenList, loading }
}