import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SiteNav from './components/SiteNav'
import SiteFooter from './components/SiteFooter'
import CityBackdrop from './components/CityBackdrop'
import ServerBackdrop from './components/ServerBackdrop'
import ShopBackdrop from './components/ShopBackdrop'
import LandingPage from './pages/LandingPage'
import MinecraftServerPage from './pages/MinecraftServerPage'
import ModelShopPage from './pages/ModelShopPage'
import './App.css'

const BACKDROPS = {
  '/server': ServerBackdrop,
  '/shop': ShopBackdrop,
}

function AnimatedRoutes() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const Backdrop = BACKDROPS[location.pathname] ?? CityBackdrop

  return (
    <>
      {/* rendered as a sibling of .page-transition, not inside it — that
          element's mount animation uses filter, which would otherwise break
          position:fixed on the backdrop (creates a new containing block) */}
      <Backdrop />
      <div className="page-transition" key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/server" element={<MinecraftServerPage />} />
          <Route path="/shop" element={<ModelShopPage />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="site">
        <SiteNav />
        <AnimatedRoutes />
        <SiteFooter />
      </div>
    </BrowserRouter>
  )
}

export default App
