import { useState, useEffect } from 'react'
import './ModeCarousel.css'

const ModeCarousel = ({ value, onChange, options }) => {
  const [currentIndex, setCurrentIndex] = useState(
    options.findIndex(option => option.value === value)
  )
  const [animationKey, setAnimationKey] = useState(0)

  // Atualiza o índice quando o value prop muda
  useEffect(() => {
    const newIndex = options.findIndex(option => option.value === value)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      setAnimationKey(prev => prev + 1)
    }
  }, [value, options, currentIndex])

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1
    setCurrentIndex(newIndex)
    setAnimationKey(prev => prev + 1)
    onChange(options[newIndex].value)
  }

  const handleNext = () => {
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    setAnimationKey(prev => prev + 1)
    onChange(options[newIndex].value)
  }

  return (
    <div className="mode-carousel">
      <button 
        className="carousel-btn carousel-btn-prev"
        onClick={handlePrevious}
        aria-label="Modo anterior"
      >
        ‹
      </button>
      
      <div className="carousel-content">
        <span 
          key={animationKey}
          className="carousel-text"
        >
          {options[currentIndex]?.label}
        </span>
      </div>
      
      <button 
        className="carousel-btn carousel-btn-next"
        onClick={handleNext}
        aria-label="Próximo modo"
      >
        ›
      </button>
    </div>
  )
}

export default ModeCarousel
