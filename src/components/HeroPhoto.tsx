"use client"

import { useState, useRef, useEffect } from "react"

interface HeroPhotoProps {
  src: string
  alt: string
}

export default function HeroPhoto({ src, alt }: HeroPhotoProps) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // A 404'd thumbnail can finish loading (and fire its error event) before
  // hydration attaches onError — check the already-settled state on mount too.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setFailed(true)
    }
  }, [])

  if (failed) {
    return <span className="font-serif italic text-faint text-3xl select-none">Ambica</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
