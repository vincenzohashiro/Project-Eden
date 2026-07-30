import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SiteNav from './components/SiteNav'
import SiteFooter from './components/SiteFooter'
import CityBackdrop from './components/CityBackdrop'
import ServerBackdrop from './components/ServerBackdrop'
import ShopBackdrop from './components/ShopBackdrop'
import LandingPage from './pages/LandingPage'
import MinecraftServerPage from './pages/MinecraftServerPage'
import ModelShopPage from './pages/ModelShopPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ComingSoonPage from './pages/ComingSoonPage'
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/portfolio"
            element={
              <ComingSoonPage
                eyebrow="PORTFOLIO"
                title="COMING SOON"
                body="A gallery of finished commissions and server builds is on the way."
              />
            }
          />
          <Route
            path="/pricing"
            element={
              <ComingSoonPage
                eyebrow="PRICING"
                title="COMING SOON"
                body="Commission and rank pricing details are being finalized."
              />
            }
          />
          <Route
            path="/reviews"
            element={
              <ComingSoonPage
                eyebrow="REVIEWS"
                title="COMING SOON"
                body="Player and client reviews will be collected here soon."
              />
            }
          />
          <Route
            path="/qa"
            element={
              <ComingSoonPage
                eyebrow="Q&A"
                title="COMING SOON"
                body="Frequently asked questions are being written up."
              />
            }
          />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="site">
          <SiteNav />
          <AnimatedRoutes />
          <SiteFooter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
