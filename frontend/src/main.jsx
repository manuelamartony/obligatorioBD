"use client";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext';
import './styles/index.css'
import App from './App.jsx'
import { FetchReportesProvider } from './context/FetchReportes.jsx';

createRoot(document.getElementById('root')).render(
  <FetchReportesProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </FetchReportesProvider>
)
