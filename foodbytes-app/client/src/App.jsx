import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import RecipeList from './components/recipes/RecipeList.jsx'
import SearchView from './components/recipes/SearchView.jsx'
import './styles/global.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/search" element={<SearchView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
