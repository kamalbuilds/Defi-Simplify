import { ethers } from 'ethers'
import { SquidBlockData } from '@/types/squid'

// ABI fragments for lending protocols
const LENDING_ABI = [
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)'
]

export const encodeLendingData = (block: SquidBlockData): string => {
  const iface = new ethers.Interface(LENDING_ABI)
  
  // Both Aave and Radiant use similar function signatures but different function names
  const functionName = block.protocol === 'aave' ? 'supply' : 'deposit'
  
  // Encode the function call
  const encodedData = iface.encodeFunctionData(functionName, [
    block.toToken, // asset address
    ethers.parseUnits(block.amount, 18), // amount with 18 decimals
    block.fromAddress, // onBehalfOf (user's address)
    0 // referralCode (0 for no referral)
  ])

  return encodedData
} 