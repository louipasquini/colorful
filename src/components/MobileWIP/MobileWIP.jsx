import { useState, useEffect } from 'react'
import './MobileWIP.css'

const MobileWIP = () => {
  const [currentColor, setCurrentColor] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#84cc16', '#f97316', '#8b5cf6', '#06b6d4'
  ]

  useEffect(() => {
    console.log('MobileWIP component mounted')
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentColor((prev) => (prev + 1) % colors.length)
        setIsAnimating(false)
      }, 300)
    }, 2000)

    return () => clearInterval(interval)
  }, [colors.length])

  return (
    <div className="mobile-wip">
      <div className="wip-background">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`color-blob ${index === currentColor ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
            style={{ 
              backgroundColor: color,
              '--delay': `${index * 0.1}s`
            }}
          />
        ))}
      </div>
      
      <div className="wip-content">
        <div className="wip-logo">
          <div className="logo-icon">
            <div className="logo-circle"></div>
            <div className="logo-circle"></div>
            <div className="logo-circle"></div>
          </div>
          <h1>Colorful</h1>
        </div>
        
        <div className="wip-message">
          <h2>Em Breve</h2>
          <p>Estamos trabalhando em uma versão otimizada para dispositivos móveis.</p>
          <p>Por enquanto, acesse pelo iPad ou desktop para a melhor experiência!</p>
        </div>
        
        <div className="wip-features">
          <div className="feature-item">
            <div className="feature-icon">🎨</div>
            <span>Gerador de Paletas</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌈</div>
            <span>Harmonias de Cores</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <span>Interface Responsiva</span>
          </div>
        </div>
        
        <div className="wip-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">Desenvolvimento em andamento...</span>
        </div>
      </div>
      
      <div className="wip-footer">
        <p>Criado por 347loui</p>
      </div>
    </div>
  )
}

export default MobileWIP
