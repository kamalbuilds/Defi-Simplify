import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TokenSelectProps {
  value: string
  onChange: (value: string) => void
  label: string
  tokens: Array<{
    address: string
    name: string
    symbol: string
    image: string
  }>
  disabled?: boolean
  disabledValue?: string
}

export const TokenSelect = ({
  value,
  onChange,
  label,
  tokens,
  disabled = false,
  disabledValue,
}: TokenSelectProps) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem 
            key={token.address} 
            value={token.name}
            disabled={token.name === disabledValue}
          >
            <div className="flex items-center gap-2">
              <Image 
                src={token.image} 
                alt={token.name} 
                width={24} 
                height={24} 
              />
              {token.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}