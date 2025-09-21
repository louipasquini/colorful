import { useState } from 'react'
import './Color.css'

const Color = ({ colorData, onColorEdit, onOpenColorPicker }) => {
  const [copiedField, setCopiedField] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const startEdit = (field, currentValue) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const saveEdit = () => {
    if (editValue && onColorEdit) {
      onColorEdit(editValue, editingField)
    }
    setEditingField(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  if (!colorData) return null

  const { hex, rgb, hsl, name } = colorData

  return (
    <div className='color' style={{ backgroundColor: `#${hex}` }}>
      <div className="color-info">
        <div className="color-name">
          {name || 'Cor sem nome'}
          <button 
            className="color-picker-btn"
            onClick={onOpenColorPicker}
            title="Abrir seletor de cores"
          >
            🎨
          </button>
        </div>
        
        <div className="color-values">
          <div className="color-value-group">
            <span className="value-label">HEX</span>
            <div className="value-container">
              {editingField === 'hex' ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  placeholder="#000000"
                />
              ) : (
                <span 
                  className="value-text editable"
                  onClick={() => startEdit('hex', `#${hex}`)}
                  title="Clique para editar"
                >
                  #{hex}
                </span>
              )}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(`#${hex}`, 'hex')}
                title="Copiar HEX"
              >
                {copiedField === 'hex' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="color-value-group">
            <span className="value-label">RGB</span>
            <div className="value-container">
              {editingField === 'rgb' ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  placeholder="rgb(0, 0, 0)"
                />
              ) : (
                <span 
                  className="value-text editable"
                  onClick={() => startEdit('rgb', rgb)}
                  title="Clique para editar"
                >
                  {rgb}
                </span>
              )}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(rgb, 'rgb')}
                title="Copiar RGB"
              >
                {copiedField === 'rgb' ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="color-value-group">
            <span className="value-label">HSL</span>
            <div className="value-container">
              {editingField === 'hsl' ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  placeholder="hsl(0, 0%, 0%)"
                />
              ) : (
                <span 
                  className="value-text editable"
                  onClick={() => startEdit('hsl', hsl)}
                  title="Clique para editar"
                >
                  {hsl}
                </span>
              )}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(hsl, 'hsl')}
                title="Copiar HSL"
              >
                {copiedField === 'hsl' ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Color