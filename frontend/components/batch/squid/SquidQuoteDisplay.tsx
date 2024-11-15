import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface QuoteDisplayProps {
  fromToken: string
  toToken: string
  amount: string
  fromChain: string
  toChain: string
}

export const SquidQuoteDisplay = ({ fromToken, toToken, amount, fromChain, toChain }: QuoteDisplayProps) => {
  const [quote, setQuote] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken || !amount) return
      
      setLoading(true)
      try {
        const response = await fetch("/api/squid/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromToken,
            toToken,
            amount,
            fromChain,
            toChain
          })
        })
        
        const data = await response.json()
        setQuote(data.quote)
      } catch (error) {
        console.error("Error fetching quote:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [fromToken, toToken, amount, fromChain, toChain])

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-500">Expected Output</span>
        <span className="text-lg font-bold">
          {loading ? "Loading..." : quote ? `${quote} ${toToken}` : "Enter amount"}
        </span>
      </div>
    </Card>
  )
}
