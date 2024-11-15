import { useQuery } from "@tanstack/react-query"
import { ethers } from "ethers"
import { tokens } from "@/config/tokens"
import ERC20 from "@/lib/artifacts/interfaces/IERC20.json"
import { useWeb3 } from "./use-web3"

export function useTokenBalance(tokenName: string) {
  const { web3Data } = useWeb3()
  const currentNet = web3Data?.network || "Ethereum Mainnet"

  return useQuery({
    queryKey: ["tokenBalance", tokenName, web3Data?.account],
    queryFn: async () => {
      if (!window.ethereum || !web3Data?.account) return null

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = provider.getSigner()
      const decimals = tokens[currentNet][tokenName]["decimals"]
      const tokenAddress = tokens[currentNet][tokenName]["address"]
      
      const erc20Contract = new ethers.Contract(tokenAddress, ERC20.abi, signer)
      const balance = await erc20Contract.balanceOf(web3Data.account)
      
      return Number(balance.toString()) / 10 ** decimals
    },
    enabled: !!web3Data?.account && !!tokenName
  })
}