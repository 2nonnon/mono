'use client'

import { useEffect, useState } from 'react'

const Position = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)

  const coords = position?.coords

  useEffect(() => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }

    const success: PositionCallback = (pos) => {
      setPosition(pos)
    }

    const error: PositionErrorCallback = (err) => {
      console.warn(`ERROR(${err.code}): ${err.message}`)
    }

    navigator.geolocation.getCurrentPosition(success, error, options)

    const id = navigator.geolocation.watchPosition(success, error, options)

    return () => {
      navigator.geolocation.clearWatch(id)
    }
  }, [])

  return (
    <>
      <div>
        <p>Your current position is:</p>
        <p>Latitude : {coords?.latitude}</p>
        <p>Longitude: {coords?.longitude}</p>
        <p>More or less {coords?.accuracy} meters.</p>
        <p>Altitude: {coords?.altitude}</p>
        <p>More or less {coords?.altitudeAccuracy} meters.</p>
        <p>Heading: {coords?.heading}</p>
        <p>Speed: {coords?.speed}</p>
      </div>
    </>
  )
}

const Main = () => {
  return (
    <>
      <Position></Position>
    </>
  )
}

export default Main
