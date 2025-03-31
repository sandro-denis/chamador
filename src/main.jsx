import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SenhaProvider } from './context/SenhaContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SenhaProvider>
        <App />
      </SenhaProvider>
    </AuthProvider>
  </React.StrictMode>,
)