import { useState, useEffect } from 'react'
import './App.css'
import Color from './components/Color/Color'
import ModeCarousel from './components/ModeCarousel/ModeCarousel'
import ColorPicker from './components/ColorPicker/ColorPicker'

function App() {
  const [scheme, setScheme] = useState([])
  const [mode, setMode] = useState('monochrome')
  const [count, setCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [pickerType, setPickerType] = useState('individual')

  const [hexValue, setHexValue] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showHelp, setShowHelp] = useState(false)

  // Comandos de teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Evita executar comandos quando estiver digitando em inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault()
          generateRandomHex()
          break
        case 'p':
          event.preventDefault()
          openColorPicker(0, 'panel')
          break
        case 'arrowright':
          event.preventDefault()
          const currentIndex = modeOptions.findIndex(option => option.value === mode)
          const nextIndex = (currentIndex + 1) % modeOptions.length
          handleModeChange(modeOptions[nextIndex].value)
          break
        case 'arrowleft':
          event.preventDefault()
          const currentIndexLeft = modeOptions.findIndex(option => option.value === mode)
          const prevIndex = currentIndexLeft === 0 ? modeOptions.length - 1 : currentIndexLeft - 1
          handleModeChange(modeOptions[prevIndex].value)
          break
        default:
          // Verifica se é uma tecla válida para hexadecimal
          if (/[0-9a-fA-F]/.test(event.key)) {
            event.preventDefault()
            const hexInput = document.querySelector('.panel-input[type="text"]')
            if (hexInput) {
              hexInput.focus()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  // Carregar paleta da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const colors = urlParams.get('colors')
    const urlMode = urlParams.get('mode')
    const urlCount = urlParams.get('count')

    if (colors) {
      const colorArray = colors.split('-')
      const schemeFromUrl = colorArray.map(hex => ({
        hex: hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex),
        name: ''
      }))
      
      setScheme(schemeFromUrl)
      if (urlMode) setMode(urlMode)
      if (urlCount) setCount(parseInt(urlCount))
      if (colorArray[0]) setHexValue(colorArray[0])
    }
  }, [])

  const modeOptions = [
    { value: 'monochrome', label: 'Monocromático' },
    { value: 'monochrome-dark', label: 'Monocromático Escuro' },
    { value: 'monochrome-light', label: 'Monocromático Claro' },
    { value: 'analogic', label: 'Análogo' },
    { value: 'complement', label: 'Complementar' },
    { value: 'analogic-complement', label: 'Análogo-Complementar' },
    { value: 'triad', label: 'Tríade' },
    { value: 'quad', label: 'Quadrático' }
  ]

  // Funções do histórico
  const addToHistory = (newScheme, newHex, newMode, newCount) => {
    const historyItem = {
      scheme: newScheme,
      hex: newHex,
      mode: newMode,
      count: newCount,
      timestamp: Date.now()
    }
    
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(historyItem)
    
    // Manter apenas 5 itens no histórico
    if (newHistory.length > 5) {
      newHistory.shift()
    } else {
      setHistoryIndex(prev => prev + 1)
    }
    
    setHistory(newHistory)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const historyItem = history[newIndex]
      setScheme(historyItem.scheme)
      setHexValue(historyItem.hex)
      setMode(historyItem.mode)
      setCount(historyItem.count)
      setHistoryIndex(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const historyItem = history[newIndex]
      setScheme(historyItem.scheme)
      setHexValue(historyItem.hex)
      setMode(historyItem.mode)
      setCount(historyItem.count)
      setHistoryIndex(newIndex)
    }
  }

  // Função para compartilhar
  const sharePalette = () => {
    if (scheme.length > 0) {
      const colors = scheme.map(color => color.hex).join('-')
      const url = `${window.location.origin}${window.location.pathname}?colors=${colors}&mode=${mode}&count=${count}`
      navigator.clipboard.writeText(url)
      alert('Link da paleta copiado para a área de transferência!')
    }
  }

  const fetchScheme = (hex, mode, count) => {
    // Remove espaços e o #, se houver
    let cleanHex = hex.trim().replace(/^#/, '')

    // Validação: só aceita 6 caracteres hexadecimais
    if (/^[0-9a-fA-F]{6,8}$/.test(cleanHex)) {
      setIsLoading(true)
      fetch(`https://www.thecolorapi.com/scheme?hex=${cleanHex}&mode=${mode}&count=${count}`)
        .then(res => res.json())
        .then(data => {
          if (data.colors && Array.isArray(data.colors)) {
            // Salva os dados completos da cor no estado
            const newScheme = data.colors.map(color => ({
              hex: color.hex?.value?.replace('#', '') || '',
              rgb: color.rgb?.value || '',
              hsl: color.hsl?.value || '',
              name: color.name?.value || ''
            })).filter(colorData => colorData.hex)
            
            setScheme(newScheme)
            addToHistory(newScheme, cleanHex, mode, count)
          } else {
            setScheme([])
          }
        })
        .catch(() => setScheme([]))
        .finally(() => setIsLoading(false))
    } else {
      setScheme([])
    }
  }

  const handleHexChange = (value) => {
    setHexValue(value)
    fetchScheme(value, mode, count)
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    fetchScheme(hexValue, newMode, count)
  }

  const handleCountChange = (newCount) => {
    setCount(newCount)
    fetchScheme(hexValue, mode, newCount)
  }

  const generateRandomHex = () => {
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setHexValue(randomHex)
    fetchScheme(randomHex, mode, count)
  }

  // Funções de conversão de cores
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgb(${r}, ${g}, ${b})`
  }

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

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  const rgbToHex = (rgb) => {
    const matches = rgb.match(/\d+/g)
    if (!matches || matches.length !== 3) return null
    const [r, g, b] = matches.map(Number)
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const hslToHex = (hsl) => {
    const matches = hsl.match(/\d+/g)
    if (!matches || matches.length !== 3) return null
    const [h, s, l] = matches.map(Number)
    
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

  const handleColorEdit = (newValue, format, colorIndex) => {
    let newHex = null

    if (format === 'hex') {
      newHex = newValue.replace('#', '')
    } else if (format === 'rgb') {
      newHex = rgbToHex(newValue)
    } else if (format === 'hsl') {
      newHex = hslToHex(newValue)
    }

    if (newHex && /^[0-9a-fA-F]{6}$/.test(newHex)) {
      // Atualiza o hex principal e regenera o esquema
      setHexValue(newHex)
      setIsLoading(true)
      
      // Regenera o esquema baseado na nova cor
      fetch(`https://www.thecolorapi.com/scheme?hex=${newHex}&mode=${mode}&count=${count}`)
        .then(res => res.json())
        .then(data => {
          if (data.colors && Array.isArray(data.colors)) {
            // Salva os dados completos da cor no estado
            const newScheme = data.colors.map(color => ({
              hex: color.hex?.value?.replace('#', '') || '',
              rgb: color.rgb?.value || '',
              hsl: color.hsl?.value || '',
              name: color.name?.value || ''
            })).filter(colorData => colorData.hex)
            
            setScheme(newScheme)
          }
        })
        .catch(() => {
          // Fallback: apenas atualiza a cor editada se a API falhar
          const updatedScheme = [...scheme]
          updatedScheme[colorIndex] = {
            ...updatedScheme[colorIndex],
            hex: newHex,
            rgb: hexToRgb(newHex),
            hsl: hexToHsl(newHex)
          }
          setScheme(updatedScheme)
        })
        .finally(() => setIsLoading(false))
    }
  }

  const openColorPicker = (colorIndex, type = 'individual') => {
    setSelectedColorIndex(colorIndex)
    setSelectedColor(scheme[colorIndex])
    setPickerType(type)
    setIsColorPickerOpen(true)
  }

  const closeColorPicker = () => {
    setIsColorPickerOpen(false)
    setSelectedColor(null)
  }

  const handleColorPickerChange = (newColorData) => {
    if (pickerType === 'panel') {
      // Para o painel: regenera o esquema completo
      setHexValue(newColorData.hex)
      setIsLoading(true)
      
      fetch(`https://www.thecolorapi.com/scheme?hex=${newColorData.hex}&mode=${mode}&count=${count}`)
        .then(res => res.json())
        .then(data => {
          if (data.colors && Array.isArray(data.colors)) {
            const newScheme = data.colors.map(color => ({
              hex: color.hex?.value?.replace('#', '') || '',
              rgb: color.rgb?.value || '',
              hsl: color.hsl?.value || '',
              name: color.name?.value || ''
            })).filter(colorData => colorData.hex)
            
            setScheme(newScheme)
          }
        })
        .catch(() => {
          // Fallback: apenas atualiza a cor se a API falhar
          const updatedScheme = [...scheme]
          updatedScheme[selectedColorIndex] = newColorData
          setScheme(updatedScheme)
        })
        .finally(() => setIsLoading(false))
    } else {
      // Para cores individuais: atualiza apenas a cor local
      const updatedScheme = [...scheme]
      updatedScheme[selectedColorIndex] = newColorData
      setScheme(updatedScheme)
    }
  }

  return (
    <div className='app'>
      {/* Botões de navegação */}
      <div className="navigation-buttons">
        <button 
          className="nav-btn undo-btn" 
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Desfazer (Ctrl+Z)"
        >
          ↶
        </button>
        <button 
          className="nav-btn redo-btn" 
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Refazer (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* Botões de ajuda e compartilhar */}
      <div className="top-right-buttons">
        <button 
          className="help-btn" 
          onClick={() => setShowHelp(!showHelp)}
          title="Ajuda - Comandos de teclado"
        >
          ?
        </button>
        <button 
          className="share-btn" 
          onClick={sharePalette}
          disabled={scheme.length === 0}
          title="Compartilhar paleta"
        >
          📤
        </button>
      </div>

      {/* Modal de ajuda */}
      {showHelp && (
        <div className="help-modal" onClick={() => setShowHelp(false)}>
          <div className="help-content" onClick={(e) => e.stopPropagation()}>
            <h3>Comandos de Teclado</h3>
            <div className="help-shortcuts">
              <div className="help-item">
                <span className="help-key">R</span>
                <span className="help-desc">Randomizar paleta</span>
              </div>
              <div className="help-item">
                <span className="help-key">P</span>
                <span className="help-desc">Abrir Color Picker</span>
              </div>
              <div className="help-item">
                <span className="help-key">← →</span>
                <span className="help-desc">Navegar modos</span>
              </div>
              <div className="help-item">
                <span className="help-key">0-9 A-F</span>
                <span className="help-desc">Focar input HEX</span>
              </div>
            </div>
            <button className="help-close" onClick={() => setShowHelp(false)}>
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className='panel'>
        <input
          type="text"
          className='panel-input'
          placeholder='Digite um hex (ex: 1a2b3c)'
          maxLength={hexValue.includes('#') ? 7 : 6}
          value={hexValue}
          onChange={(e) => handleHexChange(e.target.value)}
          title="Digite um código hexadecimal de 6 dígitos para gerar um esquema de cores"
        />
        
        <div title="Escolha o tipo de harmonia de cores para o esquema">
          <ModeCarousel
            value={mode}
            onChange={handleModeChange}
            options={modeOptions}
          />
        </div>

        <input
          type="number"
          className='panel-input'
          placeholder='Número de cores'
          min="3"
          max="8"
          value={count}
          onChange={(e) => handleCountChange(parseInt(e.target.value) || 5)}
          title="Defina quantas cores deseja no esquema (entre 3 e 8 cores)"
        />

        <button 
          className='panel-random-btn'
          onClick={generateRandomHex}
          title="Gera automaticamente um esquema de cores aleatório baseado em uma cor aleatória"
        >
          🎲
        </button>

        <button 
          className='panel-color-picker-btn'
          onClick={() => openColorPicker(0, 'panel')}
          title="Abre o seletor de cores visual para escolher uma cor e regenerar todo o esquema"
        >
          🎨
        </button>
      </div>
      <div style={{ display: 'flex', width: '100%', height: '100%', margin: '0', position: 'relative'}}>
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <span className="loading-text">Regenerando esquema...</span>
          </div>
        )}
        {scheme.map((colorData, idx) => (
          <div key={colorData.hex + idx} style={{ flex: 1, height: '100%' }}>
            <Color 
              colorData={colorData} 
              onColorEdit={(newValue, format) => handleColorEdit(newValue, format, idx)}
              onOpenColorPicker={() => openColorPicker(idx)}
            />
          </div>
        ))}
      </div>
      
      <ColorPicker
        isOpen={isColorPickerOpen}
        onClose={closeColorPicker}
        currentColor={selectedColor}
        onColorChange={handleColorPickerChange}
        colorIndex={selectedColorIndex}
        pickerType={pickerType}
      />
    </div>
  )
}

export default App
