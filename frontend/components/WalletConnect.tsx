import { greenfieldTestnet } from '@/utils/chain.utils';
import React from 'react';
import { base, bsc, mainnet, polygon } from 'thirdweb/chains';
import { ConnectButton } from 'thirdweb/react';
import { client } from "@/components/client";
import { bscGreenfield } from 'viem/chains';

const WalletConnect = () => {
    return (
        <ConnectButton client={client} chains={[bsc, mainnet, base, polygon]} />
    );
};

export default WalletConnect;