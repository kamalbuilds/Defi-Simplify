import {
  OrderBookApi,
  OrderQuoteSideKindSell,
  OrderSigningUtils,
  SubgraphApi,
} from "@cowprotocol/cow-sdk"
import { ethers6Adapter } from "thirdweb/adapters/ethers6"
import { sepolia } from "thirdweb/chains"

import { client } from "@/components/client"

export const handleGetCowSwapQuote = async ({
  activeAccount,
  activeWalletChain,
}: {
  activeAccount: any
  activeWalletChain: any
}) => {
  if (!activeAccount || !activeWalletChain) return

  const chainId = activeWalletChain.id
  const address = activeAccount.address

  const orderBookApi = new OrderBookApi({ chainId, env: "staging" })
  console.log("OrderBookApi", orderBookApi)

  const ethersSigner = await ethers6Adapter.signer.toEthers({
    client,
    chain: sepolia,
    account: activeAccount,
  })

  const quoteRequest = {
    sellToken: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1", // WETH gnosis chain
    buyToken: "0x9c58bacc331c9aa871afd802db6379a98e80cedb", // GNO gnosis chain
    from: address,
    receiver: address,
    sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
    kind: OrderQuoteSideKindSell.SELL,
  }

  console.log("quoteRequest", quoteRequest)

  const { quote } = await orderBookApi.getQuote(quoteRequest)

  console.log("Quote", quote)

  const orderSigningResult = await OrderSigningUtils.signOrder(
    quote,
    chainId,
    ethersSigner
  )

  console.log("orderSigningResult", orderSigningResult)
}
