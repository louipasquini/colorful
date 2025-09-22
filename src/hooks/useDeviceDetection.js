import { useState, useEffect } from 'react'

const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState('desktop')
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })

      // Detecção simples e robusta
      const isMobile = width <= 768 || /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isIPad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      console.log('Device detection:', { 
        width, 
        height, 
        isMobile, 
        isIPad, 
        userAgent: navigator.userAgent
      })

      if (isMobile) {
        return 'mobile'
      } else if (isIPad) {
        return 'tablet'
      } else {
        return 'desktop'
      }
    }

    // Detectar imediatamente
    const detectedType = detectDevice()
    setDeviceType(detectedType)

    // Listener para mudanças de tamanho
    const handleResize = () => {
      const newType = detectDevice()
      setDeviceType(newType)
    }

    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { deviceType, screenSize }
}

export default useDeviceDetection
