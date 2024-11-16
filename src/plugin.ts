import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { SapphireDeployer } from './components/SapphireDeployer'

const devMode = { port: 8080 }

export class SapphirePlugin extends PluginClient {
  constructor() {
    super({
      name: 'oasis-sapphire',
      methods: ['deploy'],
      dependencies: {
        solidity: "^0.8.0",
        udapp: "^1.0.0"
      }
    })
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
    return new Promise((resolve, reject) => {
      try {
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}

const plugin = new SapphirePlugin() 
import * as ReactDOM from 'react-dom'
import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { SapphireDeployer } from './components/SapphireDeployer'

const devMode = { port: 8080 }

export class SapphirePlugin extends PluginClient {
  constructor() {
    super({
      name: 'oasis-sapphire',
      methods: ['deploy'],
      dependencies: {
        solidity: "^0.8.0",
        udapp: "^1.0.0"
      }
    })
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
    return new Promise((resolve, reject) => {
      try {
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }
}

const plugin = new SapphirePlugin()