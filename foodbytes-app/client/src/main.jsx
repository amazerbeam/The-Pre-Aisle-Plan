import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { PlannerProvider } from './contexts/PlannerContext';
import './styles/global.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlannerProvider>
          <App />
        </PlannerProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
