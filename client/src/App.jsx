import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CalendarPage from './pages/CalendarPage';
import ShoppingPage from './pages/ShoppingPage';
import styles from './App.module.css';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
