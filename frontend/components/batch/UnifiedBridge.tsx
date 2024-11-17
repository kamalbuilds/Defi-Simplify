import React, { useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { zeroAddress } from "viem";
import { getEthersSigner, wagmiConfig } from "@/config/wagmi.config";
import { UnifiedABI } from "@/config/unifiedBridgeABI";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UnifiedBridgeChain } from "@/lib/UnifiedBridgeChain";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const UnifiedBridge = () => {
    const { address } = useAccount();
    const unifiedBridgeContractAddress =
        "0x528e26b25a34a4a5d0dbda1d57d318153d2ed582";

    // State for chain selection and token amount
    const [sourceChain, setSourceChain] = useState("");
    const [destinationChain, setDestinationChain] = useState("");
    const [tokenAmount, setTokenAmount] = useState("");

    const handleUnifiedBridgeSwap = async () => {
        try {
            const signer = await getEthersSigner(wagmiConfig);
            const bridgeContract = new ethers.Contract(
                unifiedBridgeContractAddress,
                UnifiedABI,
                signer,
            );

            const tokenAddress = zeroAddress;
            const amount = ethers.utils.parseUnits(tokenAmount, 18);

            const txn = await bridgeContract.bridgeAsset(
                Number(destinationChain),
                address,
                amount,
                tokenAddress,
                true,
                "0x",
                {
                    value: ethers.utils.parseEther(tokenAmount),
                    gasLimit: 300000,
                },
            );

            console.log("Txn", txn);
        } catch (error) {
            console.log("Error in creating tx", error);

        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-row gap-8">
                <Select value={sourceChain} onValueChange={(value) => { setSourceChain(value) }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Source Chain" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {UnifiedBridgeChain.map((chain) => (
                                <SelectItem key={chain.networkId} value={chain.networkId}>{chain.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select value={destinationChain} onValueChange={(value) => { setDestinationChain(value) }}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Destination Chain" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {UnifiedBridgeChain.map((chain) => (
                                <SelectItem key={chain.networkId} value={chain.networkId}>{chain.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

            </div>

            <Input
                type="text"
                placeholder="Enter token amount"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
            />
            <Button onClick={handleUnifiedBridgeSwap}>Unified Bridge</Button>
        </div>
    );
};

export default UnifiedBridge;