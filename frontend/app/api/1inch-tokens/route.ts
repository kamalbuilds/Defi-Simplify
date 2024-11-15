import { NextResponse } from 'next/server'

export async function GET() {
  try {

    console.log(process.env.ONE_INCH, "one inch")
    const response = await fetch(
      'https://api.1inch.dev/token/v1.2/multi-chain',
      {
        headers: {
          'Authorization': `Bearer okz7YzxXA8DPc7eehhXbolnROttzvKYA`,
          'Accept': 'application/json'
        }
      }
    );

    
    console.log(response, "response")

    if (!response.ok) {
      throw new Error(`1inch API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching 1inch tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    )
  }
}