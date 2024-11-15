"use client"

import { useWeb3 } from "@/hooks/use-web3"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useState } from "react"
import WalletConnect from "./WalletConnect"

export function Account() {
  const { web3Data, connect, disconnect } = useWeb3()
  const [isOpen, setIsOpen] = useState(false)



  const handleDisconnect = async () => {
    await disconnect()
    setIsOpen(false)
  }

  const isConnected = !!web3Data?.account

  return (
    <div>
      {isConnected ? (
        <>
          <Button
            variant="outline"
            onClick={() => setIsOpen(true)}
          >
            {web3Data.account &&
              `${web3Data.account.slice(0, 6)}...${web3Data.account.slice(
                web3Data.account.length - 6,
                web3Data.account.length
              )}`}
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Account Details</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p>Account: {web3Data.account}</p>
                <p>Balance: {parseFloat(web3Data.balance).toFixed(4)} ETH</p>
                <p>Network: {web3Data.network}</p>
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <WalletConnect />
      )}
    </div>
  )
}