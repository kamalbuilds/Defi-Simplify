import { useQuery } from "@tanstack/react-query"
import { ethers } from "ethers"
import {
  useActiveWallet,
  useConnect,
  useDisconnect,
  useActiveWalletChain
} from "thirdweb/react";
import { useActiveAccount } from "thirdweb/react";
import networks from "@/lib/networksMap.json"
import { RPC_URLS } from "@/lib/rpcConfig"

export function useWeb3() {
  const activeAccount = useActiveAccount();
  const address = activeAccount?.address;
  const activeWalletChain = useActiveWalletChain();
  const chainId = activeWalletChain?.id;
  const { connect, isConnecting, error } = useConnect();
  const disconnect = useDisconnect()
  const wallet = useActiveWallet()


  const { data: web3Data } = useQuery({
    queryKey: ["web3", address, chainId, isConnecting],
    queryFn: async () => {
      if (!address || !chainId || !wallet || isConnecting !== true) {
        throw new Error("Not connected")
      }

      const provider = await wallet.getProvider()
      const signer = await wallet.getSigner()

      console.log(provider, signer)
      return {
        provider,
        signer,
        account: address,
        balance: "0",
        network: networks[String(chainId) as keyof typeof networks],
        chainId
      }
    },
    enabled: !!address && !!chainId && !!wallet && isConnecting === true
  })

  return {
    web3Data,
    connect,
    disconnect,
    isConnecting,
    isConnected: isConnecting === false,
    isDisconnected: isConnecting === true,
    address
  }
}