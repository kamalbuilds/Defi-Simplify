import { StaticImageData } from "next/image"
import daiImg from "@/public/images/dai.png"
// Import token images
import ethImg from "@/public/images/eth.png"
// import wbtcImg from "@/public/images/wbtc.png"
import linkImg from "@/public/images/link.png"
import uniImg from "@/public/images/uni.jpg"
import usdcImg from "@/public/images/usdc.png"
import usdtImg from "@/public/images/usdt.png"
import bnbImg from "@/public/images/BNB_image.webp"
import busdImg from "@/public/images/BUSD_image.webp"
import pancakeImg from "@/public/images/pancake_logo.webp"

import IQouter from "@/lib/artifacts/interfaces/IQuoter.json"
import ISwapRouter from "@/lib/artifacts/interfaces/ISwapRouter.json"
// Import ABIs
import IRouter from "@/lib/artifacts/interfaces/IUniswapV2Router02.json"

interface Token {
  image: StaticImageData
  name: string
  address: string
  decimals: number
}

interface Exchange {
  name: string
  address: string
  router: {
    abi: any
    address: string
  }
  quoter?: {
    abi: any
    address: string
  }
}

export const TokensList = {
  "BSC Mainnet": [
    {
      name: "Wrapped Binance",
      symbol: "WBNB", 
      decimals: 18,
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    },
    {
      name: "PancakeSwap Token",
      symbol: "CAKE",
      decimals: 18,
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    },
    {
      name: "Binance USD",
      symbol: "BUSD",
      decimals: 18,
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    },
  ],
}

export const tokens: Record<string, Token[]> = {
  "Ethereum Mainnet": [
    {
      image: ethImg,
      name: "WETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
    {
      image: daiImg,
      name: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      image: usdcImg,
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      image: usdtImg,
      name: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      image: linkImg,
      name: "LINK",
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      decimals: 18,
    },
    {
      image: uniImg,
      name: "UNI",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      decimals: 18,
    },
  ],
  "BSC Mainnet": [
    {
      image: bnbImg,
      name: "WBNB",
      decimals: 18,
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    },
    {
      image: pancakeImg,
      name: "CAKE",
      decimals: 18,
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    },
    {
      image: busdImg,
      name: "BUSD",
      decimals: 18,
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    },
    {
      image: usdcImg,
      name: "USDC",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      decimals: 18,
    },
    {
      image: usdtImg,
      name: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
  ],
}

export const exchanges: Record<string, Exchange[]> = {
  "Ethereum Mainnet": [
    {
      name: "Uniswap V2",
      address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      router: {
        abi: IRouter,
        address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      },
    },
    {
      name: "Uniswap V3",
      address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      router: {
        abi: ISwapRouter,
        address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      },
      quoter: {
        abi: IQouter,
        address: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
      },
    },
    {
      name: "Sushiswap",
      address: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      router: {
        abi: IRouter,
        address: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
      },
    }
  ],
  "BSC Mainnet": [
    {
      name: "PancakeSwap",
      address: "",
      router: {
        abi: IRouter,
        address: "",
      },
    },
    {
      name: "Sushiswap",
      address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      router: {
        abi: IRouter,
        address: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
      },
    }
  ]
}

// Create a map of exchanges for easier lookup
export const exchangesMap: Record<string, Exchange[]> = Object.entries(
  exchanges
).reduce(
  (acc, [network, exs]) => ({
    ...acc,
    [network]: exs.reduce((map, ex) => ({ ...map, [ex.name]: ex }), {}),
  }),
  {}
)

export const getTokenByAddress = (
  network: string,
  address: string
): Token | undefined => {
  return tokens[network].find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

export const getExchangeByAddress = (
  network: string,
  address: string
): Exchange | undefined => {
  return exchanges[network].find(
    (exchange) => exchange.address.toLowerCase() === address.toLowerCase()
  )
}
