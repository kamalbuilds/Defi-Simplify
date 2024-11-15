import { BASE_URL } from "@/helpers/config"
import { NextRequest, NextResponse } from "next/server"


export async function POST(req: NextRequest) {
  try {
    const {
      sourceChain,
      destinationChain,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      walletAddress,
      hashLock,
      secretHashes,
    } = await req.json()

    const url = `${BASE_URL}/quote/build?srcChain=${sourceChain}&dstChain=${destinationChain}&srcTokenAddress=${srcTokenAddress}&dstTokenAddress=${dstTokenAddress}&amount=${amount}&walletAddress=${walletAddress}&secretHashes=${secretHashes}`
    console.log("URL", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ONE_INCH}`,
        accept: "application/json",
        "Content-type": "application/json",
      },
    })

    const result = await response.json()
    console.log("result", result)

    if (result.error) {
      return NextResponse.json({ errors: result }, { status: 400 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
