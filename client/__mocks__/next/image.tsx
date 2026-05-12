import React from 'react'

export default function MockImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />
}
