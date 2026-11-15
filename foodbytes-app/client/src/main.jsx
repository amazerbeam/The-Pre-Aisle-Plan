import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
// Theme CSS: order below is deliberate (global.css must stay after App's component CSS). Cyberpunk and
// Parchment overrides win on specificity (:root[data-theme] adds 0,2,0), not on import order.
import './styles/themes/cyberpunk/index.css'
import './styles/themes/parchment/index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { MealPlanProvider } from './contexts/MealPlanContext.jsx'
import { PetProvider } from './contexts/PetContext.jsx'
import { ShoppingListProvider } from './contexts/ShoppingListContext.jsx'
import { HomemadeSelectionsProvider } from './contexts/HomemadeSelectionsContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { applyTheme, readThemeId } from './utils/theme'
import { applyLowFx, readLowFx } from './utils/lowFx'
import './styles/themes/default.css'
import './styles/global.css'
import './styles/themes/cyberpunk.css'
import './styles/themes/parchment.css'
import './styles/themes/previews.css'

applyTheme(readThemeId())
applyLowFx(readLowFx())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <MealPlanProvider>
            <PetProvider>
              <HomemadeSelectionsProvider>
                <ShoppingListProvider>
                  <App />
                </ShoppingListProvider>
              </HomemadeSelectionsProvider>
            </PetProvider>
          </MealPlanProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
