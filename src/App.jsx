import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import CityBackdrop from './components/CityBackdrop'
import SiteNav from './components/SiteNav'
import SiteFooter from './components/SiteFooter'
import LandingPage from './pages/LandingPage'
import MinecraftServerPage from './pages/MinecraftServerPage'
import ModelShopPage from './pages/ModelShopPage'
import './App.css'

function AnimatedRoutes() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="page-transition" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/server" element={<MinecraftServerPage />} />
        <Route path="/shop" element={<ModelShopPage />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="site">
        <CityBackdrop />
        <SiteNav />
        <AnimatedRoutes />
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
