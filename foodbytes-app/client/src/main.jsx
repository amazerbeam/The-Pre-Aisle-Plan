import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { MealPlanProvider } from './contexts/MealPlanContext.jsx'
import { ShoppingListProvider } from './contexts/ShoppingListContext.jsx'
import { HomemadeSelectionsProvider } from './contexts/HomemadeSelectionsContext.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MealPlanProvider>
          <ShoppingListProvider>
            <HomemadeSelectionsProvider>
              <App />
            </HomemadeSelectionsProvider>
          </ShoppingListProvider>
        </MealPlanProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
