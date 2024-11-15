import { useQuery } from '@tanstack/react-query'

interface Token1Inch {
  chainId: number
  symbol: string
  name: string
  address: string
  decimals: number
  logoURI: string
  providers: string[]
  tags: string[]
}

export function use1InchTokens(chainId?: number) {
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['1inch-tokens', chainId],
    queryFn: async () => {

        const response  = await fetch('/api/1inch-tokens')
      const data: Token1Inch[] = await response.json()
      
      if (chainId) {
        return data.filter(token => token.chainId === chainId)
      }
      return data
    }
  })

  return { tokens, isLoading }
}
