import { useContext, useState, useEffect } from 'react'
import Image from 'next/image'
import { BlockContext } from './block.components'
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react'
import { tokens } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ArrowDownUp } from 'lucide-react'
import { usePancakeswapLiquidity } from '@/hooks/use-pancakeswap-liquidity'
import { IToken } from '@/config/tokens'

export const RemoveLiquidityUI = () => {
  const context = useContext(BlockContext)
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const { removeLiquidity } = usePancakeswapLiquidity()
  
  const [slippage, setSlippage] = useState('0.5')
  const [liquidityAmount, setLiquidityAmount] = useState('')
  const [loadingTokens, setLoadingTokens] = useState(true)
  const [fetchedTokens, setFetchedTokens] = useState<IToken[]>([])
  const [selectedTokens, setSelectedTokens] = useState({
    tokenA: '',
    tokenB: ''
  })

  const chainId = activeWalletChain?.id
  const currentNet = chainId === 56 ? 'BSC Mainnet' : 'Ethereum Mainnet'

  useEffect(() => {
    const fetchTokens = async () => {
      setLoadingTokens(true)
      if (currentNet === "Ethereum Mainnet") {
        setFetchedTokens(tokens["Ethereum Mainnet"])
      } else {
        setFetchedTokens(tokens["BSC Mainnet"])
      }
      setLoadingTokens(false)
    }
    fetchTokens()
  }, [currentNet])

  if (!context) {
    throw new Error('BlockComponent must be used within a BlockProvider')
  }

  const { block, updateBlockField } = context

  const handleRemoveLiquidity = async () => {
    if (!selectedTokens.tokenA || !selectedTokens.tokenB || !liquidityAmount) {
      alert('Please fill in all fields')
      return
    }

    try {
      const slippagePercent = parseFloat(slippage) / 100
      const amountAMin = (parseFloat(liquidityAmount) * (1 - slippagePercent)).toString()
      const amountBMin = (parseFloat(liquidityAmount) * (1 - slippagePercent)).toString()

      await removeLiquidity({
        tokenA: selectedTokens.tokenA,
        tokenB: selectedTokens.tokenB,
        liquidity: liquidityAmount,
        amountAMin,
        amountBMin,
        currentNet
      })

      alert('Liquidity removed successfully!')
    } catch (error) {
      console.error('Error removing liquidity:', error)
      alert('Failed to remove liquidity. See console for details.')
    }
  }

  if (loadingTokens) {
    return <div>Loading tokens...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTokens.tokenA}
          onValueChange={(value) => {
            setSelectedTokens(prev => ({ ...prev, tokenA: value }))
            updateBlockField(block.id, { fromToken: value })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Token A" />
          </SelectTrigger>
          <SelectContent>
            {fetchedTokens.map((token) => (
              <SelectItem 
                key={token.address} 
                value={token.name}
                disabled={token.name === selectedTokens.tokenB}
              >
                <div className="flex items-center gap-2">
                  <Image src={token.image} alt={token.name} width={24} height={24} />
                  {token.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-center">
        <div className="rounded-xl border p-2">
          <ArrowDownUp />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={selectedTokens.tokenB}
          onValueChange={(value) => {
            setSelectedTokens(prev => ({ ...prev, tokenB: value }))
            updateBlockField(block.id, { toToken: value })
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Token B" />
          </SelectTrigger>
          <SelectContent>
            {fetchedTokens.map((token) => (
              <SelectItem 
                key={token.address} 
                value={token.name}
                disabled={token.name === selectedTokens.tokenA}
              >
                <div className="flex items-center gap-2">
                  <Image src={token.image} alt={token.name} width={24} height={24} />
                  {token.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        type="number"
        placeholder="LP Token Amount"
        value={liquidityAmount}
        onChange={(e) => setLiquidityAmount(e.target.value)}
        className="mt-4"
      />

      <div className="flex items-center gap-2 mt-4">
        <span>Slippage Tolerance:</span>
        <Input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
          className="w-24"
        />
        <span>%</span>
      </div>

      <Button 
        onClick={handleRemoveLiquidity}
        disabled={!activeAccount || !selectedTokens.tokenA || !selectedTokens.tokenB || !liquidityAmount}
        className="mt-4"
      >
        Remove Liquidity
      </Button>
    </div>
  )
}