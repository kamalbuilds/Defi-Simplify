import { StaticImageData } from "next/image"
import bnbImg from "@/public/images/BNB_image.webp"
import busdImg from "@/public/images/BUSD_image.webp"
import daiImg from "@/public/images/dai.png"
import ethImg from "@/public/images/eth.png"
import linkImg from "@/public/images/link.png"
import pancake from "@/public/images/pancake_logo.webp"
import uniImg from "@/public/images/uni.jpg"
import usdcImg from "@/public/images/usdc.png"
import usdtImg from "@/public/images/usdt.png"

export interface IToken {
  image: StaticImageData
  name: string
  address: string
  decimals: number
}

export const tokens: Record<string, IToken[]> = {
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
      image: busdImg,
      name: "BUSD",
      decimals: 18,
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    },
    {
      image: pancake,
      name: "CAKE",
      decimals: 18,
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    },
    {
      image: bnbImg,
      name: "WBNB",
      decimals: 18,
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
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
