import { useEffect, useRef } from 'react'
import { SkinViewer } from 'skinview3d'

// Real WebGL 3D viewer (skinview3d/three.js) — renders the actual texture
// on a rigged player mesh with lighting, like Skindex's own viewer.
// Drag-to-rotate and scroll-to-zoom come free from three's OrbitControls,
// which attach directly to the canvas element skinview3d creates.
function SkinViewer3D({ texture, className }) {
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

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect && rect.width > 0 && rect.height > 0) {
        viewer.width = rect.width
        viewer.height = rect.height
      }
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      viewer.dispose()
    }
  }, [texture])

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default SkinViewer3D
