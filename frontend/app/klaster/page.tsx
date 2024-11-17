"use client"

import React, { useEffect, useState } from "react"
import {
  BiconomyV2AccountInitData,
  KlasterSDK,
  buildMultichainReadonlyClient,
  buildRpcInfo,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
} from "klaster-sdk"
import { useActiveAccount } from "thirdweb/react"
import { useAccount } from "wagmi"

import { Button } from "../../components/ui/button"
import {
  crossChainMint,
  initKlasterService,
} from "../../services/AbstractService"

const KlasterPage = () => {
  const { address } = useAccount()

  const [klastersdk, setKlasterSDK] = useState<string | null>(null)

  const activeAccount = useActiveAccount()

  useEffect(() => {
    ;(async () => {
      console.log("Active Account", activeAccount, address)

      if (!activeAccount || !address) return
      const klasterAddress = await initKlasterService(activeAccount, address)
      console.log("Klaster address: ", klasterAddress)

      setKlasterSDK(klasterAddress)
    })()
  }, [address, activeAccount])

  const handleButton = async () => {
    if (!activeAccount) return
    const result = await crossChainMint({ activeAccount })
    console.log("Result", result)
  }

  return (
    <div>
      <Button onClick={handleButton}>Click here</Button>
    </div>
  )
}

export default KlasterPage
