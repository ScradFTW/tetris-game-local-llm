import { COLORS } from '../tetris/constants'

function Cell({ color, isGhost, isCleared }) {
  return <div className={`cell ${color ? (isGhost ? 'ghost' : 'filled') : ''} ${isCleared ? 'cleared' : ''}`} style={{ backgroundColor: color, opacity: isGhost ? 0.5 : 1 }} />
}

export default Cell
