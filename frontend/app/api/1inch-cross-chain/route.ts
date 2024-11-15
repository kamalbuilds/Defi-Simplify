import { SDK } from '@1inch/cross-chain-sdk'

export async function POST(request: Request) {
  const { fromToken, toToken, amount, fromChainId, toChainId, slippage } = await request.json()

  try {
    const sdk = new SDK({
      url: process.env.INCH_API_URL,
      network: fromChainId,
      blockchainProvider: request.blockchainProvider
    })

    const quote = await sdk.getQuote({
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount,
      toChainId
    })

    return Response.json({ success: true, quote })
  } catch (error) {
    console.error('1inch cross-chain error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}