import React from 'react'
import ReactDOM from 'react-dom/client'
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
      ReactDOM.createRoot(root).render(
        React.createElement(SapphireDeployer)
      )
    }
  }

  async deploy() {
    return new Promise((resolve, reject) => {
      try {
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Initialize the plugin
const plugin = new SapphirePlugin()