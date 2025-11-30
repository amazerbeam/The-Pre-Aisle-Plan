import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DateRangeProvider } from './contexts/DateRangeContext';
import { PlannerProvider } from './contexts/PlannerContext';
import { Navigation } from './components/layout/Navigation';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MealPlanPage } from './pages/MealPlanPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthCallback } from './pages/AuthCallback';
import './styles/global.css';
import './styles/responsive.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DateRangeProvider>
          <PlannerProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth2/callback" element={<AuthCallback />} />

              <Route element={<Navigation />}>
                <Route path="/" element={<HomePage />} />

                <Route
                  path="/meal-plan"
                  element={
                    <ProtectedRoute>
                      <MealPlanPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/shopping"
                  element={
                    <ProtectedRoute>
                      <ShoppingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </PlannerProvider>
        </DateRangeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
