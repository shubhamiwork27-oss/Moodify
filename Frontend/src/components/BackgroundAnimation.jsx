import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function BackgroundAnimation() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Scene setup ──────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 1.5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Circular sprite texture (soft white circle) ──
    const canvas2d = document.createElement('canvas')
    canvas2d.width = canvas2d.height = 64
    const ctx = canvas2d.getContext('2d')
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0,   'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,0.6)')
    grad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 64, 64)
    const sprite = new THREE.CanvasTexture(canvas2d)

    // ── Particles ────────────────────────────────────
    const COUNT = 5000
    const positions = new Float32Array(COUNT * 3)
    const sizes     = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const r     = 2.5 * Math.cbrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi   = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      sizes[i] = 0.5 + Math.random() * 1.2   // varied sizes for depth
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color:           0xffffff,       // pure white
      size:            0.012,
      map:             sprite,          // circle texture
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.55,
      depthWrite:      false,
      blending:        THREE.AdditiveBlending,
      alphaTest:       0.01,
    })

    const points = new THREE.Points(geometry, material)
    points.rotation.z = Math.PI / 5
    scene.add(points)

    // ── Subtle drift – secondary slow layer ──────────
    const COUNT2 = 800
    const pos2 = new Float32Array(COUNT2 * 3)
    for (let i = 0; i < COUNT2; i++) {
      pos2[i * 3]     = (Math.random() - 0.5) * 5
      pos2[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos2[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    const geo2 = new THREE.BufferGeometry()
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3))
    const mat2 = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.022, map: sprite,
      sizeAttenuation: true, transparent: true, opacity: 0.18,
      depthWrite: false, blending: THREE.AdditiveBlending, alphaTest: 0.01,
    })
    const points2 = new THREE.Points(geo2, mat2)
    scene.add(points2)

    // ── Animation loop ───────────────────────────────
    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      points.rotation.x  -= delta / 28
      points.rotation.y  -= delta / 38
      points2.rotation.x += delta / 60
      points2.rotation.y -= delta / 80
      renderer.render(scene, camera)
    }
    animate()

    // ── Resize handler ───────────────────────────────
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ──────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose(); material.dispose()
      geo2.dispose(); mat2.dispose()
      sprite.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position:      'fixed',
        top: 0, left: 0,
        width:         '100vw',
        height:        '100vh',
        zIndex:        -1,
        pointerEvents: 'none',
        background:    'radial-gradient(ellipse at 60% 10%, rgba(29,185,84,0.07) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(120,80,255,0.06) 0%, transparent 50%), #0e0e12',
      }}
    />
  )
}
