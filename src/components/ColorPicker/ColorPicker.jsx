import { useState, useEffect, useRef } from 'react'
import './ColorPicker.css'

const ColorPicker = ({ isOpen, onClose, currentColor, onColorChange, colorIndex, pickerType = 'individual' }) => {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [lightness, setLightness] = useState(0)
  const [hex, setHex] = useState('')
  const [rgb, setRgb] = useState('')
  const [hsl, setHsl] = useState('')
  
  const canvasRef = useRef(null)
  const hueCanvasRef = useRef(null)
  const isDragging = useRef(false)

  // Converte hex para HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Converte HSL para hex
  const hslToHex = (h, s, l) => {
    const hNorm = h / 360
    const sNorm = s / 100
    const lNorm = l / 100

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b
    if (sNorm === 0) {
      r = g = b = lNorm
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
      const p = 2 * lNorm - q
      r = hue2rgb(p, q, hNorm + 1/3)
      g = hue2rgb(p, q, hNorm)
      b = hue2rgb(p, q, hNorm - 1/3)
    }

    return ((Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255)).toString(16).padStart(6, '0')
  }

  // Converte HSL para RGB
  const hslToRgb = (h, s, l) => {
    const hNorm = h / 360
    const sNorm = s / 100
    const lNorm = l / 100

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b
    if (sNorm === 0) {
      r = g = b = lNorm
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
      const p = 2 * lNorm - q
      r = hue2rgb(p, q, hNorm + 1/3)
      g = hue2rgb(p, q, hNorm)
      b = hue2rgb(p, q, hNorm - 1/3)
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
  }

  // Inicializa os valores quando a cor atual muda
  useEffect(() => {
    if (currentColor && isOpen) {
      const hslValues = hexToHsl(currentColor.hex)
      setHue(hslValues.h)
      setSaturation(hslValues.s)
      setLightness(hslValues.l)
      setHex(currentColor.hex)
      setRgb(currentColor.rgb)
      setHsl(currentColor.hsl)
    }
  }, [currentColor, isOpen])

  // Atualiza os valores quando HSL muda
  useEffect(() => {
    const newHex = hslToHex(hue, saturation, lightness)
    const newRgb = hslToRgb(hue, saturation, lightness)
    const newHsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    
    setHex(newHex)
    setRgb(newRgb)
    setHsl(newHsl)
  }, [hue, saturation, lightness])

  // Desenha o canvas de saturação/luminosidade
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height)

    // Cria o gradiente de saturação/luminosidade
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const saturation = (x / width) * 100
        const lightness = 100 - (y / height) * 100
        
        // Converte HSL para RGB
        const h = hue / 360
        const s = saturation / 100
        const l = lightness / 100
        
        let r, g, b
        
        if (s === 0) {
          r = g = b = l
        } else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
          }
          
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s
          const p = 2 * l - q
          r = hue2rgb(p, q, h + 1/3)
          g = hue2rgb(p, q, h)
          b = hue2rgb(p, q, h - 1/3)
        }
        
        const index = (y * width + x) * 4
        data[index] = Math.round(r * 255)     // R
        data[index + 1] = Math.round(g * 255) // G
        data[index + 2] = Math.round(b * 255) // B
        data[index + 3] = 255                 // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [hue])

  // Desenha o canvas de matiz
  useEffect(() => {
    const canvas = hueCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Limpa o canvas
    ctx.clearRect(0, 0, width, height)

    // Cria o gradiente de matiz usando ImageData para garantir visibilidade
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      const hueValue = (y / height) * 360
      
      // Converte HSL para RGB
      const h = hueValue / 360
      const s = 1.0  // Saturação máxima
      const l = 0.5  // Luminosidade média
      
      let r, g, b
      
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4
        data[index] = Math.round(r * 255)     // R
        data[index + 1] = Math.round(g * 255) // G
        data[index + 2] = Math.round(b * 255) // B
        data[index + 3] = 255                 // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [])

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newSaturation = Math.round((x / canvas.width) * 100)
    const newLightness = Math.round(100 - (y / canvas.height) * 100)
    
    setSaturation(Math.max(0, Math.min(100, newSaturation)))
    setLightness(Math.max(0, Math.min(100, newLightness)))
  }

  const handleHueClick = (e) => {
    const canvas = hueCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const y = e.clientY - rect.top
    
    const newHue = Math.round((y / canvas.height) * 360)
    setHue(Math.max(0, Math.min(360, newHue)))
  }

  const handleInputChange = (type, value) => {
    const numValue = parseInt(value) || 0
    switch (type) {
      case 'hue':
        setHue(Math.max(0, Math.min(360, numValue)))
        break
      case 'saturation':
        setSaturation(Math.max(0, Math.min(100, numValue)))
        break
      case 'lightness':
        setLightness(Math.max(0, Math.min(100, numValue)))
        break
      case 'hex':
        if (/^[0-9a-fA-F]{6}$/.test(value)) {
          const hslValues = hexToHsl(value)
          setHue(hslValues.h)
          setSaturation(hslValues.s)
          setLightness(hslValues.l)
        }
        break
    }
  }

  const handleApply = () => {
    if (onColorChange) {
      onColorChange({
        hex: hex,
        rgb: rgb,
        hsl: hsl,
        name: currentColor?.name || ''
      })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker-header">
          <h3>
            Seletor de Cores
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="color-picker-content">
          <div className="color-picker-main">
            <div className="color-preview" style={{ backgroundColor: `#${hex}` }}>
              <div className="color-preview-text">
                <span>#{hex}</span>
              </div>
            </div>
            
            <div className="color-canvas-container">
            <canvas
              ref={canvasRef}
              width={160}
              height={160}
              className="color-canvas"
              onClick={handleCanvasClick}
            />
              <div 
                className="color-pointer"
                style={{
                  left: `${(saturation / 100) * 160}px`,
                  top: `${160 - (lightness / 100) * 160}px`
                }}
              />
            </div>
            
            <div className="hue-canvas-container">
              <canvas
                ref={hueCanvasRef}
                width={25}
                height={160}
                className="hue-canvas"
                onClick={handleHueClick}
              />
              <div 
                className="hue-pointer"
                style={{
                  top: `${(hue / 360) * 160}px`
                }}
              />
            </div>
          </div>
          
          <div className="color-inputs">
            <div className="input-group">
              <label>HEX</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleInputChange('hex', e.target.value)}
                className="color-input"
              />
            </div>
            
            <div className="input-group">
              <label>H</label>
              <input
                type="number"
                value={hue}
                onChange={(e) => handleInputChange('hue', e.target.value)}
                min="0"
                max="360"
                className="color-input"
              />
            </div>
            
            <div className="input-group">
              <label>S</label>
              <input
                type="number"
                value={saturation}
                onChange={(e) => handleInputChange('saturation', e.target.value)}
                min="0"
                max="100"
                className="color-input"
              />
            </div>
            
            <div className="input-group">
              <label>L</label>
              <input
                type="number"
                value={lightness}
                onChange={(e) => handleInputChange('lightness', e.target.value)}
                min="0"
                max="100"
                className="color-input"
              />
            </div>
            
            <div className="input-group">
              <label>RGB</label>
              <input
                type="text"
                value={rgb}
                readOnly
                className="color-input readonly"
              />
            </div>
            
            <div className="input-group">
              <label>HSL</label>
              <input
                type="text"
                value={hsl}
                readOnly
                className="color-input readonly"
              />
            </div>
          </div>
        </div>
        
        <div className="color-picker-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ColorPicker
