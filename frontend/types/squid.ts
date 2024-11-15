import { ChainType } from "@0xsquid/squid-types"

export type SquidActionType = 'swap' | 'bridge' | 'lend' | 'repay' | 'borrow' | 'buyseraph'

export interface SquidBlockData {
  fromChain: string
  toChain: string
  fromToken: string
  toToken: string
  amount: string
  actionType: SquidActionType
  slippage?: number
  preHooks?: {
    chainType: ChainType
    calls: any[]
    provider: string
    description: string
  }
  postHooks?: {
    chainType: ChainType
    calls: any[]
    provider: string
    description: string
  }
}