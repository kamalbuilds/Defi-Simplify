import Web3 from 'web3'
import { Web3Like } from '@1inch/fusion-sdk'

export class Web3Adapter implements Web3Like {
  private web3: Web3

  constructor(web3: Web3) {
    this.web3 = web3
  }

  eth = {
    call: async (transactionConfig: { to: string; data: string }) => {
      return await this.web3.eth.call({
        to: transactionConfig.to,
        data: transactionConfig.data
      })
    }
  }

  extend(extension: unknown) {
    return this.web3.extend(extension)
  }
}