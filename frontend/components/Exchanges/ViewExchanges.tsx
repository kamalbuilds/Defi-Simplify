import React from "react"

import { useExchanges } from "@/hooks/use-exchanges"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Spinner from "../Spinner"

const ViewExchanges = ({
  fromToken,
  toToken,
}: {
  fromToken: string
  toToken: string
}) => {
  console.log("From token", fromToken)
  console.log("to token", toToken)

  const { data: exchanges, isLoading } = useExchanges(fromToken, toToken)
  console.log("Exchanges>>>", exchanges)

  return (
    <div className="min-h-20 w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exchange</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <Spinner />
            </>
          ) : (
            <>
              {exchanges?.map((exchange, index) => (
                <TableRow key={index}>
                  <TableCell>{exchange.exchange}</TableCell>
                  <TableCell>
                    {exchange.price !== 0 ? exchange.price.toFixed(8) : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ViewExchanges
