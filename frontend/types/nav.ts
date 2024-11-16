export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
}

export type BlockType {
  id: number
  action: string
  fromToken?: string
  toToken?: string
  amount?: string
  exchangeName?: string
  amountout?: number
  destinationChainSelector?: string
  message?: string
  fromChain?: number
  toChain?: number
}

export type BlockContextType = {
  block: BlockType
  updateBlockField: (
    id: number,
    fields: { [key: string]: string | number }
  ) => void
  setBlocks: (blocks: BlockType[]) => void
}
