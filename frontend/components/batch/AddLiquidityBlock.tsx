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

export const AddLiquidityBlock = () => {
  const context = useContext(BlockContext)
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()
  const { addLiquidity } = usePancakeswapLiquidity()
  
  const [slippage, setSlippage] = useState('0.5')
  const [amountB, setAmountB] = useState('')
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

  const handleAddLiquidity = async () => {
    if (!selectedTokens.tokenA || !selectedTokens.tokenB || !block.amount || !amountB) {
      alert('Please fill in all fields')
      return
    }

    try {
      const slippagePercent = parseFloat(slippage) / 100
      const amountAMin = (parseFloat(block.amount) * (1 - slippagePercent)).toString()
      const amountBMin = (parseFloat(amountB) * (1 - slippagePercent)).toString()

      await addLiquidity({
        tokenA: selectedTokens.tokenA,
        tokenB: selectedTokens.tokenB,
        amountADesired: block.amount,
        amountBDesired: amountB,
        amountAMin,
        amountBMin,
        currentNet
      })

      alert('Liquidity added successfully!')
    } catch (error) {
      console.error('Error adding liquidity:', error)
      alert('Failed to add liquidity. See console for details.')
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
        <Input
          type="number"
          placeholder="Amount A"
          value={block.amount || ''}
          onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
        />
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
        <Input
          type="number"
          placeholder="Amount B"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
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
        onClick={handleAddLiquidity} 
        disabled={!activeAccount || !selectedTokens.tokenA || !selectedTokens.tokenB}
      >
        Add Liquidity
      </Button>
    </div>
  )
}
