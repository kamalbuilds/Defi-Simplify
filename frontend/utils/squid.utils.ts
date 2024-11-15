import axios from 'axios';
import { ethers } from 'ethers';

export const getSquidRoute = async (params: any) => {
    const result = await axios.post(
        'https://v2.api.squidrouter.com/v2/route',
        params,
        {
            headers: {
                'x-integrator-id': process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID,
                'Content-Type': 'application/json',
            }
        }
    );
    return result.data.route;
};

export const executeSquidTransaction = async (route: any, account: any) => {
    const ethersSigner = await ethers6Adapter.signer.toEthers({
        client,
        chain: sourceChain === 'opbnb' ? opbnb : bsc,
        account: account,
    });

    const tx = await ethersSigner.sendTransaction({
        to: route.transactionRequest.targetAddress,
        data: route.transactionRequest.data,
        value: route.transactionRequest.value,
        gasLimit: route.transactionRequest.gasLimit,
    });

    return tx;
};

export const monitorTransaction = async (
    txHash: string, 
    fromChainId: string, 
    toChainId: string
) => {
    const statusEndpoint = 'https://api.squidrouter.com/v1/status';
    let status = 'ongoing';
    
    while (status === 'ongoing') {
        const response = await axios.get(statusEndpoint, {
            params: {
                transactionId: txHash,
                fromChainId,
                toChainId
            },
            headers: {
                'x-integrator-id': process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID
            }
        });
        
        status = response.data.squidTransactionStatus;
        if (status === 'success') break;
        if (status === 'failed') throw new Error('Transaction failed');
        
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
};