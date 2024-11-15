import React, { FC, useContext } from "react"

import { BlockContextType, BlockType } from "@/types/nav"

import { AddLiquidityBlock } from "./AddLiquidityBlock"
import SwapBlock from "./SwapBlock"
import OneInchBlock from "./1inchBlock"
import SquidBlock from "./SquidBlock"
import { RemoveLiquidityBlock } from "./removeliquidityblock"

export const BlockContext = React.createContext<BlockContextType | undefined>(
  undefined
)

const BlockComponent: FC<BlockContextType> = ({
  block,
  updateBlockField,
  setBlocks,
}) => {
  return (
    <BlockContext.Provider
      value={{
        block,
        updateBlockField,
        setBlocks,
      }}
    >
      {block.action === "Squid Router" && <SquidBlock />}
      {block.action === "Swap" && <SwapBlock />}
      {block.action === "Add Liquidity" && <AddLiquidityBlock />}
      {block.action === "1inch Cross Chain Swap" && <OneInchBlock />}
      {block.action === "Remove Liquidity" && <RemoveLiquidityBlock />}
  
    </BlockContext.Provider>
  )
}

export default BlockComponent
