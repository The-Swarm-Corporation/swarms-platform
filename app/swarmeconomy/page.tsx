'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SwarmsEconomy() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to swarms.world
    window.location.href = 'https://swarms.world'
  }, [])

  // Return empty div while redirecting
  return null
}