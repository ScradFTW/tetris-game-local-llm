import { ROWS, COLS, COLORS } from '../tetris/constants'
import Cell from './Cell'

function Board({ board, current, ghost, clearedLines }) {
  const renderCell = (x, y) => {
    let color = board[y]?.[x]
    let isGhost = false
    let isCleared = clearedLines && clearedLines.includes(y)
    
    if (!color && current && current.matrix) {
      const pieceY = y - current.y
      const pieceX = x - current.x
      if (pieceY >= 0 && pieceY < current.matrix.length && pieceX >= 0 && pieceX < current.matrix[0].length) {
        if (current.matrix[pieceY][pieceX] === 1) {
          color = COLORS[current.type]
          isGhost = false
        }
      }
    }
    
    if (!color && ghost && ghost.matrix) {
      const ghostY = y - ghost.y
      const ghostX = x - ghost.x
      if (ghostY >= 0 && ghostY < ghost.matrix.length && ghostX >= 0 && ghostX < ghost.matrix[0].length) {
        if (ghost.matrix[ghostY][ghostX] === 1) {
          color = ghost.type ? COLORS[ghost.type] : null
          isGhost = true
        }
      }
    }
    
    return <Cell key={`${x}-${y}`} color={color} isGhost={isGhost} isCleared={isCleared} />
  }

  return (
    <div className="board">
      {Array.from({ length: ROWS }).map((_, y) => (
        <div key={y} className="row">
          {Array.from({ length: COLS }).map((_, x) => renderCell(x, y))}
        </div>
      ))}
    </div>
  )
}

export default Board
