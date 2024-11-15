import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
  const SUPPORTED_CHAINS = [
    { id: 1, name: "Ethereum" },
    { id: 56, name: "BSC" },
    { id: 137, name: "Polygon" },
    { id: 43114, name: "Avalanche" },
    { id: 42161, name: "Arbitrum" }
  ]
  
  interface ChainSelectProps {
    value: string
    onChange: (value: string) => void
    label: string
  }
  
  export const ChainSelect = ({ value, onChange, label }: ChainSelectProps) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">{label}</label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Chain" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CHAINS.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }