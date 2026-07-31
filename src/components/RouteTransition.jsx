import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Full-screen decorative flourish that plays over every route change —
// including the homepage, which renders on its own separate branch in
// App.jsx and otherwise gets no transition at all when navigating to/from it.
function RouteTransition() {
  const location = useLocation()
  const [active, setActive] = useState(false)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return undefined
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    setActive(true)
    const timer = setTimeout(() => setActive(false), 520)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!active) return null

  return (
    <div className="route-transition" aria-hidden="true">
      <span className="route-glitch-slice s1" />
      <span className="route-glitch-slice s2" />
      <span className="route-glitch-slice s3" />
      <span className="route-glitch-slice s4" />
      <span className="route-glitch-noise" />
    </div>
  )
}

export default RouteTransition
