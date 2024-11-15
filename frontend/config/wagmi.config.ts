import { greenfieldTestnet } from '@/utils/chain.utils'
import { bsc, bscGreenfield, mainnet } from 'viem/chains'
import { http, createConfig } from 'wagmi'

export const wagmiConfig = createConfig({
    chains: [bsc, mainnet, bscGreenfield, greenfieldTestnet],
    transports: {
        [mainnet.id]: http(),
        [bsc.id]: http(),
        [bscGreenfield.id]: http(),
        [greenfieldTestnet.id]: http(),
    },
})