import React from 'react'

/* eslint-disable @next/next/no-img-element */
export default function MockImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />
}
