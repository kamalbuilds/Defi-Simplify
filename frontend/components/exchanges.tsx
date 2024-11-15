"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useExchanges } from "@/hooks/use-exchanges"

interface ExchangesProps {
  token0: string
  token1: string
}

export function Exchanges({ token0, token1 }: ExchangesProps) {
  console.log("Token 0: ", token0);
  console.log("Token 1: ", token1);

  const { data: exchanges, isLoading } = useExchanges(token0, token1)

  console.log("exchanges", exchanges)
  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exchange</TableHead>
          <TableHead>Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exchanges?.map((exchange, index) => (
          <TableRow key={index}>
            <TableCell>{exchange.exchange}</TableCell>
            <TableCell>
              {exchange.price !== 0 ? exchange.price.toFixed(8) : "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}