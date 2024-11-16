import React from 'react'
import ReactDOM from 'react-dom'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { SapphireDeployer } from './components/SapphireDeployer'

const devMode = { port: 8080 }

export class SapphirePlugin extends PluginClient {
  constructor() {
    super()
    this.methods = ['deploy']
    createClient(this)
    this.initUI()
  }

  private initUI() {
    const root = document.getElementById('root')
    if (root) {
      ReactDOM.render(
        React.createElement(SapphireDeployer),
        root
      )
    }
  }

  async deploy() {
    // This method can be called from Remix IDE
    return new Promise((resolve, reject) => {
      try {
        // Implementation will be handled by the React component
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Initialize the plugin
const plugin = new SapphirePlugin()