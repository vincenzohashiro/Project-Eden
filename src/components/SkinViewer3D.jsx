import { useEffect, useRef } from 'react'
import { IdleAnimation, SkinViewer } from 'skinview3d'

// Real WebGL 3D viewer (skinview3d/three.js) - renders the actual texture
// on a rigged player mesh with lighting, like Skindex's own viewer.
// Drag-to-rotate and scroll-to-zoom come free from three's OrbitControls,
// which attach directly to the canvas element skinview3d creates.
// apiRef (optional) receives { rotate(deg) } for external rotate controls
function SkinViewer3D({ texture, className, idle = false, apiRef }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return undefined

    const { width, height } = container.getBoundingClientRect()
    const viewer = new SkinViewer({
      canvas,
      width: width || 220,
      height: height || 300,
      fov: 50,
      zoom: 0.75,
    })
    viewer.controls.enablePan = false
    viewer.controls.minDistance = 25
    viewer.controls.maxDistance = 110
    viewer.loadSkin(texture, { model: 'auto-detect' }).catch(() => {})

    // optional breathing/arm-sway loop so a showcase model doesn't sit frozen
    if (idle && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewer.animation = new IdleAnimation()
    }

    // eased turn of the model itself, so it composes with drag-orbiting
    let raf = 0
    if (apiRef) {
      apiRef.current = {
        rotate(deg) {
          cancelAnimationFrame(raf)
          const wrapper = viewer.playerWrapper
          const from = wrapper.rotation.y
          const to = from + (deg * Math.PI) / 180
          const start = performance.now()
          const step = (now) => {
            const t = Math.min((now - start) / 450, 1)
            const eased = 1 - (1 - t) ** 3
            wrapper.rotation.y = from + (to - from) * eased
            if (t < 1) raf = requestAnimationFrame(step)
          }
          raf = requestAnimationFrame(step)
        },
      }
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect && rect.width > 0 && rect.height > 0) {
        viewer.width = rect.width
        viewer.height = rect.height
      }
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      if (apiRef) apiRef.current = null
      observer.disconnect()
      viewer.dispose()
    }
  }, [texture, idle, apiRef])

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default SkinViewer3D
