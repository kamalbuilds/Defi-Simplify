"use client"
import { Client } from '@bnb-chain/greenfield-js-sdk';

export const GRPC_URL = process.env.NEXT_PUBLIC_GRPC_URL;
export const GREENFIELD_RPC_URL = process.env.NEXT_PUBLIC_GREENFIELD_RPC_URL;
export const GREEN_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_GREEN_CHAIN_ID as string);
export const BSC_RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC_URL;
export const BSC_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_BSC_CHAIN_ID as string);

export const greenFieldClient = Client.create('https://gnfd-testnet-fullnode-tendermint-ap.bnbchain.org', String(GREEN_CHAIN_ID));

export const getSps = async () => {
    const sps = await greenFieldClient.sp.getStorageProviders();
    const finalSps = (sps ?? []).filter((v: any) => v.endpoint.includes('nodereal'));

    return finalSps;
};

export const getAllSps = async () => {
    const sps = await getSps();

    return sps.map((sp) => {
        return {
            address: sp.operatorAddress,
            endpoint: sp.endpoint,
            name: sp.description?.moniker,
        };
    });
};

export const selectSp = async () => {
    const finalSps = await getSps();

    const selectIndex = Math.floor(Math.random() * finalSps.length);

    const secondarySpAddresses = [
        ...finalSps.slice(0, selectIndex),
        ...finalSps.slice(selectIndex + 1),
    ].map((item) => item.operatorAddress);
    const selectSpInfo = {
        id: finalSps[selectIndex].id,
        endpoint: finalSps[selectIndex].endpoint,
        primarySpAddress: finalSps[selectIndex]?.operatorAddress,
        sealAddress: finalSps[selectIndex].sealAddress,
        secondarySpAddresses,
    };

    return selectSpInfo;
};
