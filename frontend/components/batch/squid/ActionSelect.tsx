import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { SquidActionType } from "@/types/squid"
  
  interface ActionSelectProps {
    value: SquidActionType
    onChange: (value: SquidActionType) => void
  }
  
  export const ActionSelect = ({ value, onChange }: ActionSelectProps) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Action Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="swap">Cross-Chain Swap</SelectItem>
          <SelectItem value="bridge">Bridge</SelectItem>
          <SelectItem value="lend">Lend</SelectItem>
          <SelectItem value="repay">Repay</SelectItem>
          <SelectItem value="borrow">Borrow</SelectItem>
          <SelectItem value="buyseraph">Buy Seraph NFTs</SelectItem>
        </SelectContent>
      </Select>
    )
  }