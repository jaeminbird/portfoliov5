'use client'

import React, { useRef, useEffect, useCallback, useSyncExternalStore, useState, lazy, Suspense } from 'react'
import Image from 'next/image'

// Lazy-load Three.js components to keep the initial bundle small.
const ThreeJSLogo = lazy(() => import('./three-logo'))

// Shared fallback — used during SSR, when WebGL is missing, and as
// the Suspense boundary placeholder while Three.js loads.
function FallbackLogo() {
  return (
    <div className="w-full h-80 md:h-96 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={128}
        height={128}
        priority
        className="w-32 h-32 md:w-40 md:h-40"
        sizes="(max-width: 768px) 128px, 160px"
      />
    </div>
  )
}

// useSyncExternalStore subscribe/snapshot helpers for client detection.
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Logo container with progressive enhancement.
 *
 * Rendering strategy:
 * 1. SSR / initial paint → static SVG fallback (instant, no JS required).
 * 2. Client mount → checks WebGL support and begins observing visibility.
 * 3. IntersectionObserver fires → lazy-loads the Three.js bundle and
 *    renders the interactive 3D wireframe logo.
 *
 * The IntersectionObserver uses a 50px `rootMargin` so the heavy Three.js
 * chunk starts downloading just before the logo scrolls into view.
 */
export default function Logo() {
  const isClient = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)
  const [shouldLoadThreeJS, setShouldLoadThreeJS] = useState(false)
  const intersectionRef = useRef<HTMLDivElement>(null)

  /**
   * Probes WebGL support by creating a throwaway canvas context.
   * Cleans up the context immediately to avoid holding GPU resources.
   */
  const checkWebGLSupport = useCallback(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl =
        (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)
      const supported = !!gl

      if (gl) {
        const loseContext = gl.getExtension('WEBGL_lose_context')
        if (loseContext) loseContext.loseContext()
      }
      canvas.remove()

      return supported
    } catch {
      return false
    }
  }, [])

  // Compute WebGL support synchronously on client (safe since isClient guards this).
  const webglSupported = isClient ? checkWebGLSupport() : null

  // Start loading Three.js when the logo area is near the viewport.
  useEffect(() => {
    if (!isClient || webglSupported !== true) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shouldLoadThreeJS) {
          setShouldLoadThreeJS(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' },
    )

    const el = intersectionRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
      observer.disconnect()
    }
  }, [isClient, webglSupported, shouldLoadThreeJS])

  if (!isClient || webglSupported === false) {
    return <FallbackLogo />
  }

  return (
    <div
      ref={intersectionRef}
      className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden bg-white"
    >
      {webglSupported === true && shouldLoadThreeJS ? (
        <Suspense fallback={<FallbackLogo />}>
          <ThreeJSLogo />
        </Suspense>
      ) : (
        <FallbackLogo />
      )}
    </div>
  )
}