import { useEffect, useState } from 'react'
import './SciFiDoorLoader.css'

const SCAN_DURATION = 2600
const UNLOCK_DELAY = 550
const OPEN_DURATION = 2400

function SciFiDoorLoader({ children }) {
  const [phase, setPhase] = useState('scan')
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSkip(true)
      return
    }

    const timers = [
      setTimeout(() => setPhase('unlock'), SCAN_DURATION),
      setTimeout(() => setPhase('open'), SCAN_DURATION + UNLOCK_DELAY),
      setTimeout(
        () => setPhase('done'),
        SCAN_DURATION + UNLOCK_DELAY + OPEN_DURATION,
      ),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  const showLoader = !skip && phase !== 'done'

  return (
    <>
      {showLoader && (
        <div className={`door-loader phase-${phase}`} aria-hidden="true">
          <div className="door-frame">
            <div className="door-panel left">
              <span className="door-crease" />
              <span className="door-vent v1" />
              <span className="door-vent v2" />
              <span className="door-hatch" />
            </div>
            <div className="door-panel right">
              <span className="door-crease" />
              <span className="door-vent v1" />
              <span className="door-vent v2" />
              <span className="door-hatch" />
            </div>
            <div className="door-bolt" />
            <div className="door-scanline" />
            <div className="door-hud">
              <span className="hud-corner tl" />
              <span className="hud-corner tr" />
              <span className="hud-corner bl" />
              <span className="hud-corner br" />
            </div>
            <div className="lock-ring-anchor">
              <div className="lock-ring">
                <span className="lock-ring-track" />
                <span
                  className="lock-needle-wrap"
                  style={{ animationDuration: `${SCAN_DURATION}ms` }}
                >
                  <span className="lock-needle" />
                </span>
                <span className="lock-core" />
              </div>
            </div>
            <div className="door-flash" />
          </div>
        </div>
      )}
      {children}
    </>
  )
}

export default SciFiDoorLoader
