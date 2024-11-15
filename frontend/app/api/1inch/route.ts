import { NextRequest, NextResponse } from "next/server"
import { Web3Adapter } from '@/lib/web3-adapter'
import { PrivateKeyProviderConnector } from "@1inch/cross-chain-sdk"
import Web3 from "web3"

export async function POST(req: NextRequest) {
  try {
    const { chainId, fromToken, toToken, amount, fromChainId, toChainId } = await req.json()

    const rpc = chainId === 56 ? 'https://bsc-rpc.publicnode.com' : 'https://ethereum-rpc.publicnode.com'
    const web3 = new Web3(rpc)
    const web3Adapter = new Web3Adapter(web3)
    const pvd = new PrivateKeyProviderConnector(
      process.env.NEXT_PUBLIC_PRIVATE_KEY || '', 
      web3Adapter
    )

    const swapData = {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount,
      fromChainId,
      toChainId,
      walletAddress: pvd.wallet.address
    }

    // Call 1inch API for quote
    const quoteResponse = await fetch(`https://api.1inch.dev/swap/v5.2/${fromChainId}/quote`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(swapData)
    })

    const quote = await quoteResponse.json()

    // Execute the swap
    const swapResponse = await fetch(`https://api.1inch.dev/swap/v5.2/${fromChainId}/swap`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...swapData,
        slippage: 1
      })
    })

    const swapResult = await swapResponse.json()

    return NextResponse.json({ 
      success: true, 
      quote,
      swap: swapResult
    })

  } catch (error) {
    console.error("1inch API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
