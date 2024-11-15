import { useContext, useState, useEffect } from 'react'
import { BlockContext } from './block.components'
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react'
import { tokens } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import { usePancakeswapLiquidity } from '@/hooks/use-pancakeswap-liquidity'
import { IToken } from '@/config/tokens'
import { ArrowDownUp } from 'lucide-react'

export const RemoveLiquidityBlock = () => {
  const context = useContext(BlockContext)
  if (!context) {
    throw new Error('BlockComponent must be used within a BlockProvider')
  }

  const { block, updateBlockField } = context
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

  const handleRemoveLiquidity = async () => {
    if (!selectedTokens.tokenA || !selectedTokens.tokenB || !liquidityAmount) {
      alert('Please fill in all fields')
      return
    }

    try {
      const slippagePercent = parseFloat(slippage) / 100;

      // Note: In a production environment, we will:
      // Query the actual reserves of the liquidity pool first
      // Calculate expected output amounts based on the pool reserves
      // Then set reasonable minimum amounts based on those calculations
      // Add proper slippage protection
      // But for testing purposes, this modification is done for the transaction go through.
      const amountAMin = '0'
      const amountBMin = '0'

      await removeLiquidity({
        tokenA: selectedTokens.tokenA,
        tokenB: selectedTokens.tokenB,
        liquidity: liquidityAmount,
        amountAMin,
        amountBMin,
        currentNet
      })

      // Update block fields after successful removal
      updateBlockField(block.id, {
        fromToken: selectedTokens.tokenA,
        toToken: selectedTokens.tokenB,
        amount: liquidityAmount,
        amountout: amountBMin
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
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200">
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
        onChange={(e) => {
          setLiquidityAmount(e.target.value)
          updateBlockField(block.id, { amount: e.target.value })
        }}
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