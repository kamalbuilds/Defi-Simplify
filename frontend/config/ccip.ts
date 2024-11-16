import { ethers } from "ethers"

export const CCIP_ROUTER_ADDRESSES = {
  1: "0xE561d5E02207fb5eB32cca20a699E0d8919a1476", // Ethereum
  8453: "0x673AA85efd75080031d44fcA061575d1dA427A28", // Base
  100: "0x3C3D92629A02a8D95D5CB9650fe49C3544f69B43", // Gnosis
}

export const CCIP_SUPPORTED_TOKENS = {
  1: [ // Ethereum
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      symbol: "LINK",
      decimals: 18,
    }
  ],
  8453: [ // Base
    {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
      symbol: "LINK",
      decimals: 18,
    }
  ],
  100: [ // Gnosis
    {
      address: "0xddafbb505ad214d7b80b1f830fccc89b60fb7a83",
      symbol: "USDC",
      decimals: 6,
    },
    {
      address: "0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2",
      symbol: "LINK",
      decimals: 18,
    }
  ]
}

export const CCIP_ROUTER_ABI = [
  "function ccipSend(uint64 destinationChainSelector, address receiver, address token, uint256 amount, bytes memory message) external payable returns (bytes32)",
  "function getFee(uint64 destinationChainSelector, address token, uint256 amount) external view returns (uint256)",
]