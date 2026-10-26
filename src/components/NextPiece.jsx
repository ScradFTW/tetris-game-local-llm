import { COLORS } from '../tetris/constants'

function NextPiece({ next }) {
  if (!next) return null
  
  const GRID_SIZE = 4
  const matrix = next.matrix
  const offsetY = Math.floor((GRID_SIZE - matrix.length) / 2)
  const offsetX = Math.floor((GRID_SIZE - matrix[0].length) / 2)
  
  return (
    <div className="next-piece">
      {Array.from({ length: GRID_SIZE }, (_, y) => (
        <div key={y} className="piece-row">
          {Array.from({ length: GRID_SIZE }, (__, x) => {
            const localY = y - offsetY
            const localX = x - offsetX
            const filled = localY >= 0 && localY < matrix.length && localX >= 0 && localX < matrix[0].length && matrix[localY][localX]
            return (
              <div key={x} className={`cell ${filled ? 'filled' : ''}`} style={{ backgroundColor: filled ? COLORS[next.type] : 'transparent' }} />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default NextPiece
