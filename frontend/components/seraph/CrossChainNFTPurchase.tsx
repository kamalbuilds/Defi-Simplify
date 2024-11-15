import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useActiveAccount } from 'thirdweb/react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import Spinner from '@/components/Spinner';

const SERAPH_NFT_ADDRESS = '0xbb3f21dd9b16741e9822392f753d07da4c6b6cd6';
const SERAPH_TOKEN_ID = '3136';
const INTEGRATOR_ID = process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID;

export const CrossChainNFTPurchase = () => {
    const activeAccount = useActiveAccount();
    const [loading, setLoading] = useState(false);
    const [sourceChain, setSourceChain] = useState('opbnb'); // or 'bsc'

    const handleCrossChainPurchase = useCallback(async () => {
        if (!activeAccount) return;
        setLoading(true);

        try {
            const fromChainId = sourceChain === 'opbnb' ? '204' : '56';
            const toChainId = '1'; // Ethereum

            // Get NFT price from OpenSea API
            const nftPrice = await fetchNFTPrice(SERAPH_NFT_ADDRESS, SERAPH_TOKEN_ID);

            const params = {
                fromAddress: activeAccount.address,
                fromChain: fromChainId,
                fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native token
                fromAmount: ethers.parseEther(nftPrice).toString(),
                toChain: toChainId,
                toToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
                toAddress: activeAccount.address,
                slippage: 1,
                quoteOnly: false,
                postHooks: [
                    {
                        callType: 0,
                        target: SERAPH_NFT_ADDRESS,
                        value: ethers.parseEther(nftPrice).toString(),
                        callData: encodePurchaseData(SERAPH_TOKEN_ID, nftPrice),
                        estimatedGas: '300000'
                    }
                ]
            };

            const route = await getSquidRoute(params);
            const tx = await executeSquidTransaction(route, activeAccount);
            
            await monitorTransaction(tx.hash, fromChainId, toChainId);
            
            alert('NFT Purchase Successful!');
        } catch (error) {
            console.error('Cross-chain purchase failed:', error);
            alert('Failed to purchase NFT. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [activeAccount, sourceChain]);

    return (
        <div className="flex flex-col gap-4 p-4">
            <h2 className="text-xl font-bold">Cross-Chain Seraph NFT Purchase</h2>
            
            <Select
                value={sourceChain}
                onValueChange={setSourceChain}
                options={[
                    { label: 'opBNB', value: 'opbnb' },
                    { label: 'BSC', value: 'bsc' }
                ]}
            />

            <Button 
                onClick={handleCrossChainPurchase}
                disabled={loading || !activeAccount}
            >
                {loading ? (
                    <Spinner className="mr-2" />
                ) : null}
                Purchase Seraph NFT from {sourceChain.toUpperCase()}
            </Button>
        </div>
    );
};