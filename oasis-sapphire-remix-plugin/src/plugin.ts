import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { SapphireDeployer } from './components/SapphireDeployer'

const devMode = { port: 8080 }

export class SapphirePlugin extends PluginClient {
  constructor() {
    super()
    this.methods = ['deploy']
    createClient(this)
  }

  async deploy() {
    // Implementation
  }
}