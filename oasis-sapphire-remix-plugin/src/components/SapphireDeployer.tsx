import React, { useState, useEffect } from 'react'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import * as sapphire from '@oasisprotocol/sapphire-paratime'
import { ethers } from 'ethers'
import { NetworkManager } from './NetworkManager'

const client = createClient(new PluginClient())

export const SapphireDeployer: React.FC = () => {
  const [deployed, setDeployed] = useState('')
  const [network, setNetwork] = useState('')
  const [compiling, setCompiling] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    client.onload(() => {
      console.log('Plugin loaded!')
    })
  }, [])

  const deployContract = async () => {
    setError('')
    setDeploying(true)
    
    try {
      const compiled = await client.call('solidity', 'getCompilationResult')
      
      if (!compiled || !compiled.data) {
        throw new Error('No compilation result found. Please compile your contract first.')
      }

      const contractName = Object.keys(compiled.data.contracts['test.sol'])[0]
      const contract = compiled.data.contracts['test.sol'][contractName]

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const wrappedProvider = sapphire.wrap(provider)
      const signer = wrappedProvider.getSigner()

      const factory = new ethers.ContractFactory(
        contract.abi,
        contract.evm.bytecode.object,
        signer
      )

      const deployedContract = await factory.deploy()
      await deployedContract.deployed()

      setDeployed(deployedContract.address)
      
      // Notify Remix about the deployment
      await client.call('udapp', 'sendTransaction', {
        data: contract.evm.bytecode.object,
        to: deployedContract.address,
        gasLimit: '3000000',
        value: '0',
        from: await signer.getAddress(),
        useCall: true
      })

    } catch (err: any) {
      setError(err.message || 'Deployment failed')
      console.error(err)
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div className="sapphire-deployer">
      <h2>Oasis Sapphire Deployment</h2>
      
      <NetworkManager onNetworkChange={setNetwork} />
      
      <div className="deployment-section">
        <button 
          onClick={deployContract}
          disabled={deploying || !network}
        >
          {deploying ? 'Deploying...' : 'Deploy Contract'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {deployed && (
          <div className="success-message">
            Contract deployed at: {deployed}
          </div>
        )}
      </div>
    </div>
  )
}