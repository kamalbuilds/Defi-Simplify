import React from "react"
import { TokenSelect } from "@/components/TokenSelect"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"

export const SquidLend = ({ block, updateBlockField }) => {
  return (
    <div className="flex flex-col gap-4">
      <TokenSelect
        value={block.lendToken}
        onChange={(value) => updateBlockField(block.id, { lendToken: value })}
        label="Token to Lend"
      />
      <Input
        type="number"
        placeholder="Amount"
        value={block.amount}
        onChange={(e) => updateBlockField(block.id, { amount: e.target.value })}
      />
      <Select
        value={block.protocol}
        onValueChange={(value) => updateBlockField(block.id, { protocol: value })}
        label="Lending Protocol"
        options={[
          { label: "Aave", value: "aave" },
          { label: "Radiant", value: "radiant" }
        ]}
      />
    </div>
  )
}