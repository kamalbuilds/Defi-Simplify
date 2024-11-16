import * as React from 'react'
import { ethers } from 'ethers'

interface NetworkManagerProps {
  onNetworkChange: (network: string) => void
}

export const NetworkManager: React.FC<NetworkManagerProps> = ({ onNetworkChange }) => {
  const switchToSapphire = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x5AFF',  // 23295
          chainName: 'Sapphire TestNet',
          nativeCurrency: {
            name: 'TEST',
            symbol: 'TEST',
            decimals: 18
          },
          rpcUrls: ['https://testnet.sapphire.oasis.dev'],
          blockExplorerUrls: ['https://testnet.explorer.sapphire.oasis.dev']
        }]
      })
      onNetworkChange('sapphire')
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  return (
    <div className="network-manager">
      <button onClick={switchToSapphire}>
        Switch to Sapphire TestNet
      </button>
    </div>
  )
}