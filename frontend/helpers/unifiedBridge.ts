import { ethers } from "ethers"
import { ethers6Adapter } from "thirdweb/adapters/ethers6"
import { sepolia } from "thirdweb/chains"
import { zeroAddress } from "viem"

import { UnifiedABI } from "@/config/unifiedBridgeABI"
import { client } from "@/components/client"

export const UnifiedBridge = async ({
  activeAccount,
}: {
  activeAccount: any
}) => {
  if (!activeAccount) return
  const unifiedBridgeContractAddress =
    "0x528e26b25a34a4a5d0dbda1d57d318153d2ed582"

  const ethersSigner = await ethers6Adapter.signer.toEthers({
    client,
    chain: sepolia,
    account: activeAccount,
  })

  const bridgeContract = new ethers.Contract(
    unifiedBridgeContractAddress,
    UnifiedABI,
    ethersSigner
  )

  console.log("Bridge: ", bridgeContract)

  const destinationNetworkId = 1 // Ensure this matches the destination network ID
  const tokenAddress = zeroAddress // ERC20 token contract address
  const tokenAmount = ethers.parseUnits("0.1", 18) // Amount of tokens to bridge (10 tokens with 18 decimals)
  const destinationAddress = activeAccount.address // The address to send tokens to

  const txn = await bridgeContract.bridgeAsset(
    destinationNetworkId,
    destinationAddress,
    tokenAmount,
    tokenAddress,
    true,
    "0x",
    {
      value: ethers.parseEther("0.05"), // Enter amount here
      gasLimit: 300000, // Optional: Adjust as needed
    }
  )

  console.log("Txn", txn)
}
