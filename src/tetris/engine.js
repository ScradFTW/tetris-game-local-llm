import { COLS, ROWS, PIECES, COLORS, PIECE_TYPES, BASE_INTERVAL, MIN_INTERVAL, LEVEL_INTERVAL_STEP, LINES_PER_LEVEL, LINE_SCORES } from './constants.js'

// Re-export for convenience
export { LINES_PER_LEVEL, LINE_SCORES }

// Create empty board
export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

// Rotate matrix 90 degrees clockwise
export function rotateMatrix(matrix) {
  const rows = matrix.length
  const cols = matrix[0].length
  const result = Array.from({ length: cols }, () => Array(rows).fill(0))
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      result[x][rows - 1 - y] = matrix[y][x]
    }
  }
  return result
}

// Check if piece collides with board at given position
export function collides(board, matrix, pos) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === 1) {
        const boardX = pos.x + x
        const boardY = pos.y + y
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return true
        if (boardY >= 0 && board[boardY][boardX] !== null) return true
      }
    }
  }
  return false
}

// Check if a cell in the board is occupied
export function isCellOccupied(board, x, y) {
  if (y < 0) return false
  if (x < 0 || x >= COLS) return true
  return board[y][x] !== null
}

// Merge a piece into the board
export function mergePiece(board, matrix, pos, color) {
  const newBoard = board.map(row => [...row])
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] === 1) {
        const boardY = pos.y + y
        const boardX = pos.x + x
        if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
          newBoard[boardY][boardX] = color
        }
      }
    }
  }
  return newBoard
}

// Clear completed lines
export function clearLines(board) {
  let linesCleared = 0
  const clearedLineIndices = []
  const newBoard = []
  
  for (let y = 0; y < board.length; y++) {
    const isFull = board[y].every(cell => cell !== null)
    if (isFull) {
      linesCleared++
      clearedLineIndices.push(y)
    } else {
      newBoard.push(board[y])
    }
  }
  
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(null))
  }
  
  return { board: newBoard, linesCleared, clearedLineIndices }
}

// Score for clearing lines
export function getScore(linesCleared, level) {
  return linesCleared * LINE_SCORES[linesCleared] * (level + 1)
}

// Get ghost piece position (where it would land)
export function getGhostPosition(board, matrix, pos) {
  let ghostY = pos.y
  while (!collides(board, matrix, { x: pos.x, y: ghostY + 1 })) {
    ghostY++
  }
  return { x: pos.x, y: ghostY }
}

// Create a new piece
export function spawnPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  const matrix = PIECES[type]
  // Center the piece horizontally
  const x = Math.floor((COLS - matrix[0].length) / 2)
  // Spawn at row 0
  const y = 0
  return { type, matrix, x, y }
}

// Rotate with basic wall kicks
export function rotateWithKick(board, matrix, pos, dir = 1) {
  let currentMatrix = matrix
  let currentPos = pos
  let kickOffset = 0
  
  for (let i = 0; i < 4; i++) {
    currentMatrix = rotateMatrix(currentMatrix)
    const kickX = kickOffset * dir
    if (!collides(board, currentMatrix, { x: currentPos.x + kickX, y: currentPos.y })) {
      return { matrix: currentMatrix, x: currentPos.x + kickX, y: currentPos.y }
    }
    kickOffset++
  }
  
  // Try rotating counter-clockwise
  for (let i = 0; i < 4; i++) {
    currentMatrix = rotateMatrix(currentMatrix)
    if (!collides(board, currentMatrix, currentPos)) {
      return { matrix: currentMatrix, x: currentPos.x, y: currentPos.y }
    }
  }
  
  return { matrix, x: pos.x, y: pos.y }
}

// Get piece type from matrix
export function getPieceType(matrix) {
  for (const [key, piece] of Object.entries(PIECES)) {
    if (JSON.stringify(piece) === JSON.stringify(matrix)) return key
  }
  return null
}

// Calculate fall interval based on level
export function getFallInterval(level) {
  return Math.max(MIN_INTERVAL, BASE_INTERVAL - level * LEVEL_INTERVAL_STEP)
}
