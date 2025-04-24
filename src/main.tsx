import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './i18n'

import './styles/global.css'

try {
  console.log = typeof __electronLog.info === 'function' ? __electronLog.info : console.log
} catch (error) {
  console.error('replace console.log failed', error)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)

window.postMessage({ payload: 'removeLoading' }, '*')
