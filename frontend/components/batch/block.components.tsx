import React, { FC, useContext } from "react"

import { BlockContextType, BlockType } from "@/types/nav"

import OneInchBlock from "./1inchBlock"
import { AddLiquidityBlock } from "./AddLiquidityBlock"
import CCIPBlock from "./CCIPBlock"
import CowSwapBlock from "./CowSwapBlock"
import Lifi from "./Lifi"
import SquidBlock from "./SquidBlock"
import SwapBlock from "./SwapBlock"
import { RemoveLiquidityBlock } from "./removeliquidityblock"
import UnifiedBridge from "./UnifiedBridge"

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
      {block.action === "CoW Swap" && <CowSwapBlock />}
      {block.action === "CCIP Transfer" && <CCIPBlock />}
      {block.action === "Lifi Swap" && <Lifi />}
      {block.action === "Unified Bridge" && <UnifiedBridge />}
    </BlockContext.Provider>
  )
}

export default BlockComponent
