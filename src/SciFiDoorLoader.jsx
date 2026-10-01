import { useEffect, useState } from 'react'
import './SciFiDoorLoader.css'

const SCAN_DURATION = 2600
const UNLOCK_DELAY = 550
const OPEN_DURATION = 2400

// progress ring: 11 segments filled in 11 steps across SCAN_DURATION
const RING_R = 66
const RING_C = 2 * Math.PI * RING_R
const SEGMENTS = 11
const SEG_GAP = 4

function SealLock({ id }) {
  const seg = RING_C / SEGMENTS
  return (
    <div className="seal">
      <span className="seal-plate" />
      <svg className="seal-svg" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <mask id={`${id}-seg`}>
            <circle
              cx="100"
              cy="100"
              r={RING_R}
              fill="none"
              stroke="#fff"
              strokeWidth="9"
              strokeDasharray={`${seg - SEG_GAP} ${SEG_GAP}`}
              transform="rotate(-90 100 100)"
            />
          </mask>
          <clipPath id={`${id}-core`}>
            <circle cx="100" cy="100" r="44" />
          </clipPath>
        </defs>

        {/* outer graduated bezel */}
        <g className="seal-ticks">
          <circle cx="100" cy="100" r="92" fill="none" strokeWidth="3" strokeDasharray="1 8.63" />
          <circle cx="100" cy="100" r="92" fill="none" strokeWidth="7" strokeDasharray="2 142.5" />
        </g>

        {/* broken counter-rotating arc ring */}
        <circle
          className="seal-arcs"
          cx="100"
          cy="100"
          r="81"
          fill="none"
          strokeWidth="2"
          strokeDasharray="70 18 26 18 110 18 40 18 109 82"
        />

        {/* scan progress */}
        <g mask={`url(#${id}-seg)`}>
          <circle className="seal-track" cx="100" cy="100" r={RING_R} fill="none" strokeWidth="9" />
          <circle
            className="seal-progress"
            cx="100"
            cy="100"
            r={RING_R}
            fill="none"
            strokeWidth="9"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C}
            transform="rotate(-90 100 100)"
            style={{ '--ring-c': RING_C, animationDuration: `${SCAN_DURATION}ms` }}
          />
        </g>

        {/* core window: iris rings + sweeping scan beam */}
        <g clipPath={`url(#${id}-core)`}>
          <circle className="seal-core-bg" cx="100" cy="100" r="44" />
          <circle className="seal-iris a" cx="100" cy="100" r="34" fill="none" strokeWidth="1.5" strokeDasharray="14 6" />
          <circle className="seal-iris b" cx="100" cy="100" r="25" fill="none" strokeWidth="1" strokeDasharray="3 4" />
          <rect className="seal-beam" x="56" y="54" width="88" height="5" />
        </g>
        <circle className="seal-core-rim" cx="100" cy="100" r="44" fill="none" strokeWidth="1.5" />
        <polygon
          className="seal-hex"
          points="113.9,92 113.9,108 100,116 86.1,108 86.1,92 100,84"
          strokeWidth="1.5"
        />
        <circle className="seal-dot" cx="100" cy="100" r="5" />
      </svg>
    </div>
  )
}

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
              <span className="door-bolts" />
              <span className="door-hatch">
                <span className="hatch-meter">
                  <span
                    className="hatch-meter-fill"
                    style={{ animationDuration: `${SCAN_DURATION}ms` }}
                  />
                </span>
                <span className="hatch-leds">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </div>
            <div className="door-panel right">
              <span className="door-crease" />
              <span className="door-vent v1" />
              <span className="door-vent v2" />
              <span className="door-bolts" />
              <span className="door-hatch">
                <span className="hatch-meter">
                  <span
                    className="hatch-meter-fill"
                    style={{ animationDuration: `${SCAN_DURATION}ms` }}
                  />
                </span>
                <span className="hatch-leds">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </div>
            <div className="door-bolt" />
            <div className="air-jet left" />
            <div className="air-jet right" />
            <div className="door-vapor">
              <span className="vapor-puff p1" />
              <span className="vapor-puff p2" />
              <span className="vapor-puff p3" />
              <span className="vapor-puff p4" />
              <span className="vapor-puff p5" />
            </div>
            <div className="door-scanline" />
            <div className="door-hud">
              <span className="hud-corner tl" />
              <span className="hud-corner tr" />
              <span className="hud-corner bl" />
              <span className="hud-corner br" />
            </div>
            {/* one seal rendered into each door's anchor, each clipped to
                its own half, so it splits down the seam and rides out
                with the panels */}
            <div className="seal-anchor left">
              <SealLock id="seal-l" />
            </div>
            <div className="seal-anchor right">
              <SealLock id="seal-r" />
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
