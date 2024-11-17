import { ERC20_ABI } from "@/helpers/ERC20ABI"
import { acrossBridgePlugin } from "@/plugin/AcrossBridgePlugin"
import { ethers } from "ethers"
import {
  BiconomyV2AccountInitData,
  ExecuteResponse,
  KlasterSDK,
  MultichainClient,
  MultichainTokenMapping,
  UnifiedBalanceResult,
  batchTx,
  buildItx,
  buildMultichainReadonlyClient,
  buildRpcInfo,
  buildTokenMapping,
  deployment,
  encodeBridgingOps,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
  rawTx,
} from "klaster-sdk"
import { Account } from "thirdweb/dist/types/exports/wallets.native"
import {
  Address,
  WalletClient,
  encodeFunctionData,
  erc20Abi,
  parseEther,
} from "viem"
import { arbitrumSepolia, baseSepolia, mainnet, sepolia } from "viem/chains"

import { NFT_ABI } from "@/config/NFTABI"

const NFT_BASE = "0x071Ff778e91cFF52e9b3A30A672b2daeD7972FAF"
const NFT_MINT_PRICE = 100000n // $0.1

const USDC_SEPOLIA = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
const USDC_BASE = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
const USDC_ARBITRUM = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"

// const ETH_SEPOLIA = "0x0000000000000000000000000000000000000000"
// const ETH_BASE = "0x0000000000000000000000000000000000000000"
// const ETH_ARB = "0x0000000000000000000000000000000000000000"

// const USDC_SEPOLIA = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // mainnet USDC Ethereum
// const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // mainnet usdc base
// const USDC_ARBITRUM = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" //mainnet usdc arbitrum

let activeAccount: Account
let eoaAddress: string
let klaster: KlasterSDK<BiconomyV2AccountInitData>
let mcClient: MultichainClient
let mcUSDC: MultichainTokenMapping

export async function initKlasterService(
  activeAccount: Account,
  address: string
): Promise<string> {
  activeAccount = activeAccount
  eoaAddress = address
  klaster = await initKlaster({
    accountInitData: loadBicoV2Account({
      owner: address as `0x${string}`,
      salt: "00000000000000000000000000000001",
    }),
    nodeUrl: klasterNodeHost.default,
  })

  console.log("Klaster >>>", klaster)

  mcClient = buildMultichainReadonlyClient([
    buildRpcInfo(sepolia.id, sepolia.rpcUrls.default.http[0]),
    buildRpcInfo(arbitrumSepolia.id, arbitrumSepolia.rpcUrls.default.http[0]),
    buildRpcInfo(baseSepolia.id, baseSepolia.rpcUrls.default.http[0]),
  ])

  mcUSDC = buildTokenMapping([
    deployment(sepolia.id, USDC_SEPOLIA),
    deployment(arbitrumSepolia.id, USDC_ARBITRUM),
    deployment(baseSepolia.id, USDC_BASE),
  ])

  return klaster.account.getAddress(mainnet.id)!
}

export async function getKlasterBalance(): Promise<UnifiedBalanceResult> {
  return mcClient.getUnifiedErc20Balance({
    account: klaster.account,
    tokenMapping: mcUSDC,
  })
}

export async function crossChainSwap({
  activeAccount,
  destinationChainId,
  amount,
}: {
  activeAccount: Account
  destinationChainId: number
  amount: bigint
}): Promise<ExecuteResponse> {
  const uBalance = await getKlasterBalance()

  console.log("uBalance: ", uBalance)
  console.log("activeAccount: ", activeAccount)

  const bridgingOps = await encodeBridgingOps({
    tokenMapping: mcUSDC,
    account: klaster.account,
    amount: amount,
    bridgePlugin: acrossBridgePlugin,
    client: mcClient,
    destinationChainId: destinationChainId,
    unifiedBalance: uBalance,
  })

  console.log("bridgingOps: ", bridgingOps)

  // const mintOperation = batchTx(baseSepolia.id, [
  //   rawTx({
  //     gasLimit: 100000n,
  //     to: USDC_BASE,
  //     data: encodeFunctionData({
  //       abi: erc20Abi,
  //       functionName: "approve",
  //       args: [NFT_BASE, NFT_MINT_PRICE],
  //     }),
  //   }),
  //   rawTx({
  //     gasLimit: 100000n,
  //     to: NFT_BASE,
  //     data: encodeFunctionData({
  //       abi: NFT_ABI,
  //       functionName: "mint",
  //       args: [],
  //     }),
  //   }),
  // ])

  const iTx = buildItx({
    // BridgingOPs + Execution on the destination chain
    // added as steps to the iTx
    steps: bridgingOps.steps,
    // Klaster works with cross-chain gas abstraction. This instructs the Klaster
    // nodes to take USDC on Optimism as tx fee payment.
    feeTx: klaster.encodePaymentFee(sepolia.id, "ETH"),
  })

  const quote = await klaster.getQuote(iTx)
  console.log("quote", quote)

  const signature = await activeAccount.signMessage({
    message: {
      raw: quote.itxHash,
    },
  })

  return klaster.execute(quote, signature)
}
