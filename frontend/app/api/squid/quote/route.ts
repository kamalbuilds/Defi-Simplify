import { NextResponse } from "next/server"
import { Squid } from "@0xsquid/sdk"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fromToken, toToken, amount, fromChain, toChain } = body

    const squid = new Squid({ 
      baseUrl: "https://apiplus.squidrouter.com/v2/",
      integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || "",
    })
    
    await squid.init()

    const { route } = await squid.getRoute({
      fromChain: parseInt(fromChain),
      toChain: parseInt(toChain),
      fromToken,
      toToken,
      fromAmount: amount,
      slippage: 1,
    })

    return NextResponse.json({ quote: route.estimate.toAmount })
  } catch (error) {
    console.error("Quote error:", error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
} 