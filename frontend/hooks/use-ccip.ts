import { useCallback } from "react"
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react"
import { ethers } from "ethers"
import { ethers6Adapter } from "thirdweb/adapters/ethers6"
import { client } from "@/components/client"
import { CCIP_ROUTER_ADDRESSES, CCIP_ROUTER_ABI } from "@/config/ccip"
import { getEthersSigner, wagmiConfig } from "@/config/wagmi.config"

export function useCCIP() {
  const activeAccount = useActiveAccount()
  const activeWalletChain = useActiveWalletChain()


  const sendMessage = useCallback(async ({
    destinationChainSelector,
    receiver,
    token,
    amount,
    message = ""
  }: {
    destinationChainSelector: string
    receiver: string
    token: string
    amount: string
    message?: string
  }) => {
    if (!activeAccount || !activeWalletChain) {
      throw new Error("No active account or chain")
    }

    const signer = await getEthersSigner(wagmiConfig)

    const routerAddress = CCIP_ROUTER_ADDRESSES[activeWalletChain.id]

    if (!routerAddress) {
      throw new Error("CCIP not supported on this chain")
    }

    const router = new ethers.Contract(
      routerAddress,
      CCIP_ROUTER_ABI,
      signer
    )

    // Get the fee for the transfer
    const fee = await router.getFee(
      destinationChainSelector,
      token,
      ethers.utils.parseUnits(amount, 18)
    )

    // Execute the CCIP transfer
    const tx = await router.ccipSend(
      destinationChainSelector,
      receiver,
      token,
      ethers.utils.parseUnits(amount, 18),
      ethers.utils.toUtf8Bytes(message),
      { value: fee }
    )

    return tx
  }, [activeAccount, activeWalletChain])

  return { sendMessage }
}