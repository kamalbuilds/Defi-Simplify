import * as React from 'react';
import  { useState } from 'react'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { ethers } from 'ethers'

const client = createClient(new PluginClient())

const SAPPHIRE_TESTNET = {
  chainId: 23295,
  name: 'Sapphire TestNet',
  rpcUrls: ['https://testnet.sapphire.oasis.dev'],
  nativeCurrency: { name: 'TEST', symbol: 'TEST', decimals: 18 }
}

export const SapphireDeployer = () => {
  const [deployed, setDeployed] = useState('')
  
  const deployContract = async () => {
    try {
      // Get compiled contract from Remix
      const compiled = await client.call('solidity', 'getCompilationResult')
      const contract = compiled.data.contracts['test.sol']['Test']
      
      // Setup provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const wrappedProvider = sapphire.wrap(provider)
      const signer = wrappedProvider.getSigner()
      
      // Deploy contract
      const factory = new ethers.ContractFactory(
        contract.abi,
        contract.evm.bytecode.object,
        signer
      )
      
      const deployedContract = await factory.deploy()
      await deployedContract.deployed()
      
      setDeployed(deployedContract.address)
      
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <h3>Deploy to Sapphire</h3>
      <button onClick={deployContract}>Deploy Contract</button>
      {deployed && <p>Deployed to: {deployed}</p>}
    </div>
  )
}