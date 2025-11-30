import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import MobileNav from './components/layout/MobileNav';
import Loading from './components/common/Loading';

// Pages
import LoginPage from './pages/LoginPage';
import RecipesPage from './pages/RecipesPage';
import PlannerPage from './pages/PlannerPage';
import ShoppingPage from './pages/ShoppingPage';
import ProfilePage from './pages/ProfilePage';

import './App.css';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Header />
              <Navigation />
              <main className="app__main">
                <Routes>
                  <Route path="/" element={<Navigate to="/recipes" replace />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/recipes" replace />} />
                </Routes>
              </main>
              <MobileNav />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
