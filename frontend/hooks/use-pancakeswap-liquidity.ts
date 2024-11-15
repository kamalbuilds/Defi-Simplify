import { useCallback } from 'react'
import { ethers } from 'ethers'
import { useActiveAccount } from 'thirdweb/react'
import { tokens } from '@/lib/helpers'
import { PANCAKESWAP_ROUTER_V2_ADDRESS } from '@/config/constants'
import RouterABI from '@/lib/artifacts/interfaces/IUniswapV2Router02.json'
import { ethers6Adapter } from 'thirdweb/adapters/ethers6'
import { client } from "@/components/client";
import { bsc } from 'thirdweb/chains'
import { erc20Abi } from 'viem'
import { factoryabi } from '@/config/pancakefactoryAbi'
import { pancakepairabi } from '@/config/pancakepairAbi';

export function usePancakeswapLiquidity() {
  const activeAccount = useActiveAccount()

  const removeLiquidity = useCallback(async ({
    tokenA,
    tokenB,
    liquidity,
    amountAMin,
    amountBMin,
    currentNet
  }: {
    tokenA: string
    tokenB: string
    liquidity: string
    amountAMin: string
    amountBMin: string
    currentNet: string
  }) => {
    if (!activeAccount) throw new Error('No active account')

    const token0 = tokens[currentNet].find(t => t.name === tokenA)
    const token1 = tokens[currentNet].find(t => t.name === tokenB)

    if (!token0 || !token1) throw new Error('Tokens not found')

    // Convert amounts to proper decimals
    const liquidityWei = ethers.parseUnits(liquidity, 18) // LP tokens typically have 18 decimals
    const amountAMinWei = ethers.parseUnits(amountAMin, token0.decimals)
    const amountBMinWei = ethers.parseUnits(amountBMin, token1.decimals)

    // Get deadline 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20

    // Create contract instances
    const provider = new ethers.BrowserProvider(window.ethereum)
    const ethersSigner = await ethers6Adapter.signer.toEthers({
      client,
      chain: bsc,
      account: activeAccount,
    });
    const router = new ethers.Contract(
      PANCAKESWAP_ROUTER_V2_ADDRESS,
      RouterABI.abi,
      ethersSigner
    )

    
    // Get pair address
    const pairAddress = await router.factory().then(factory => {
      console.log(factory,"factory");
      const factorycontract = new ethers.Contract(factory, factoryabi, ethersSigner)
      return factorycontract.getPair(token0.address, token1.address)
    })

    console.log(pairAddress,"pairAddress")

    // Approve LP tokens
    const pairContract = new ethers.Contract(
      pairAddress,
      pancakepairabi,
      ethersSigner
    )

    console.log(pairContract,"pairContract")

    // Check existing allowance
    const allowance = await pairContract.allowance(activeAccount.address, PANCAKESWAP_ROUTER_V2_ADDRESS)
    console.log(allowance,"allowance", liquidityWei , allowance < liquidityWei)
    // Only approve if current allowance is less than required amount
    if (allowance < liquidityWei) {
      await pairContract.approve(PANCAKESWAP_ROUTER_V2_ADDRESS, liquidityWei)
    }

  
console.log(token0.address,
  token1.address,
  liquidityWei,
  amountAMinWei,
  amountBMinWei,
  activeAccount.address,
  deadline,"removeLiquidity")
    // Remove liquidity
    const tx = await router.removeLiquidity(
      token0.address,
      token1.address,
      liquidityWei,
      amountAMinWei,
      amountBMinWei,
      activeAccount.address,
      deadline
    )

    return tx.wait()
  }, [activeAccount])

  const addLiquidity = useCallback(async ({
    tokenA,
    tokenB,
    amountADesired,
    amountBDesired,
    amountAMin,
    amountBMin,
    currentNet
  }: {
    tokenA: string
    tokenB: string
    amountADesired: string
    amountBDesired: string
    amountAMin: string
    amountBMin: string
    currentNet: string
  }) => {
    if (!activeAccount) throw new Error('No active account')

    const token0 = tokens[currentNet].find(t => t.name === tokenA)
    const token1 = tokens[currentNet].find(t => t.name === tokenB)

    if (!token0 || !token1) throw new Error('Tokens not found')

    // Convert amounts to proper decimals
    const amountADesiredWei = ethers.parseUnits(amountADesired, token0.decimals)
    const amountBDesiredWei = ethers.parseUnits(amountBDesired, token1.decimals)
    const amountAMinWei = ethers.parseUnits(amountAMin, token0.decimals)
    const amountBMinWei = ethers.parseUnits(amountBMin, token1.decimals)

    console.log(amountADesiredWei,"amountADesiredWei")
    console.log(amountBDesiredWei,"amountBDesiredWei")
    console.log(amountAMinWei,"amountAMinWei")
    console.log(amountBMinWei,"amountBMinWei")

    // Get deadline 20 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20

    // Create contract instance
    const provider = new ethers.BrowserProvider(window.ethereum);

    const ethersSigner = await ethers6Adapter.signer.toEthers({
      client,
      chain: bsc,
      account: activeAccount,
    });
    const router = new ethers.Contract(
      PANCAKESWAP_ROUTER_V2_ADDRESS,
      RouterABI.abi,
      ethersSigner
    )
    // Approve tokens
    const tokenAContract = new ethers.Contract(
      token0.address,
      erc20Abi,
      ethersSigner
    )
    const tokenBContract = new ethers.Contract(
      token1.address,
      erc20Abi,
      ethersSigner
    )

    // Approve both tokens

    // Check existing allowances
    const allowanceA = await tokenAContract.allowance(activeAccount.address, PANCAKESWAP_ROUTER_V2_ADDRESS)
    const allowanceB = await tokenBContract.allowance(activeAccount.address, PANCAKESWAP_ROUTER_V2_ADDRESS)

    console.log(allowanceA,"allowanceA",allowanceB,"allowanceB")
    // Only approve if current allowance is less than desired amount
    if (allowanceA < amountADesiredWei) {
      await tokenAContract.approve(PANCAKESWAP_ROUTER_V2_ADDRESS, amountADesiredWei)
    }
    if (allowanceB < amountBDesiredWei) {
      await tokenBContract.approve(PANCAKESWAP_ROUTER_V2_ADDRESS, amountBDesiredWei)
    }
    

    // Add liquidity
    const tx = await router.addLiquidity(
      token0.address,
      token1.address,
      amountADesiredWei,
      amountBDesiredWei,
      amountAMinWei,
      amountBMinWei,
      activeAccount.address,
      deadline
    )

    return tx.wait()
  }, [activeAccount])


  return { removeLiquidity , addLiquidity }
}