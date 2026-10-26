import { describe, it, expect } from 'vitest'
import {
  createEmptyBoard,
  rotateMatrix,
  collides,
  isCellOccupied,
  mergePiece,
  clearLines,
  getScore,
  getGhostPosition,
  spawnPiece,
  rotateWithKick,
  getPieceType,
  getFallInterval,
  LINES_PER_LEVEL,
  LINE_SCORES,
} from '../tetris/engine'
import { COLS, ROWS, PIECES, COLORS, PIECE_TYPES, MIN_INTERVAL } from '../tetris/constants'

describe('createEmptyBoard', () => {
  it('creates a board with correct dimensions', () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(ROWS)
    expect(board[0]).toHaveLength(COLS)
    expect(board).toEqual(Array.from({ length: ROWS }, () => Array(COLS).fill(null)))
  })
})

describe('rotateMatrix', () => {
  it('rotates a 2x2 matrix 90 degrees clockwise', () => {
    const matrix = [
      [1, 2],
      [3, 4],
    ]
    const result = rotateMatrix(matrix)
    expect(result).toEqual([
      [3, 1],
      [4, 2],
    ])
  })

  it('rotates a 3x3 matrix 90 degrees clockwise', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]
    const result = rotateMatrix(matrix)
    expect(result).toEqual([
      [7, 4, 1],
      [8, 5, 2],
      [9, 6, 3],
    ])
  })

  it('rotates the I piece 90 degrees clockwise', () => {
    const iPiece = PIECES.I
    const rotated = rotateMatrix(iPiece)
    expect(rotated).toEqual([
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ])
  })

  it('rotates the T piece 90 degrees clockwise', () => {
    const tPiece = PIECES.T
    const rotated = rotateMatrix(tPiece)
    expect(rotated).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ])
  })
})

describe('collides', () => {
  const board = createEmptyBoard()

  it('returns false when piece is within bounds', () => {
    const piece = PIECES.O
    expect(collides(board, piece, { x: 0, y: 0 })).toBe(false)
  })

  it('returns true when piece goes left of bounds', () => {
    const piece = PIECES.O
    expect(collides(board, piece, { x: -1, y: 0 })).toBe(true)
  })

  it('returns true when piece goes right of bounds', () => {
    const piece = PIECES.O
    expect(collides(board, piece, { x: COLS, y: 0 })).toBe(true)
  })

  it('returns true when piece goes below bounds', () => {
    const piece = PIECES.O
    expect(collides(board, piece, { x: 0, y: ROWS })).toBe(true)
  })

  it('returns true when piece overlaps occupied cell', () => {
    const piece = PIECES.O
    const occupiedBoard = createEmptyBoard()
    occupiedBoard[0][0] = 'red'
    expect(collides(occupiedBoard, piece, { x: 0, y: 0 })).toBe(true)
  })

  it('returns false when piece is above the board', () => {
    const piece = PIECES.O
    expect(collides(board, piece, { x: 0, y: -1 })).toBe(false)
  })
})

describe('isCellOccupied', () => {
  const board = createEmptyBoard()
  board[5][5] = 'red'

  it('returns false for empty cell', () => {
    expect(isCellOccupied(board, 0, 0)).toBe(false)
  })

  it('returns true for occupied cell', () => {
    expect(isCellOccupied(board, 5, 5)).toBe(true)
  })

  it('returns false for out-of-bounds row (above)', () => {
    expect(isCellOccupied(board, 5, -1)).toBe(false)
  })

  it('returns true for out-of-bounds column (left)', () => {
    expect(isCellOccupied(board, -1, 5)).toBe(true)
  })

  it('returns true for out-of-bounds column (right)', () => {
    expect(isCellOccupied(board, COLS, 5)).toBe(true)
  })
})

describe('mergePiece', () => {
  it('merges a piece into an empty board', () => {
    const board = createEmptyBoard()
    const piece = PIECES.O
    const pos = { x: 0, y: 0 }
    const result = mergePiece(board, piece, pos, 'red')
    expect(result[0][0]).toBe('red')
    expect(result[0][1]).toBe('red')
    expect(result[1][0]).toBe('red')
    expect(result[1][1]).toBe('red')
  })

  it('does not modify the original board', () => {
    const board = createEmptyBoard()
    const piece = PIECES.O
    const pos = { x: 0, y: 0 }
    const originalBoard = createEmptyBoard()
    mergePiece(board, piece, pos, 'red')
    expect(board).toEqual(originalBoard)
  })

  it('merges piece at arbitrary position', () => {
    const board = createEmptyBoard()
    const piece = PIECES.O
    const pos = { x: 5, y: 5 }
    const result = mergePiece(board, piece, pos, 'blue')
    expect(result[5][5]).toBe('blue')
    expect(result[5][6]).toBe('blue')
    expect(result[6][5]).toBe('blue')
    expect(result[6][6]).toBe('blue')
  })

  it('ignores cells outside board bounds', () => {
    const board = createEmptyBoard()
    const piece = PIECES.O
    const pos = { x: COLS - 1, y: ROWS - 1 }
    const result = mergePiece(board, piece, pos, 'red')
    expect(result[ROWS - 1][COLS - 1]).toBe('red')
  })
})

describe('clearLines', () => {
  it('returns 0 lines cleared on empty board', () => {
    const board = createEmptyBoard()
    const { linesCleared } = clearLines(board)
    expect(linesCleared).toBe(0)
  })

  it('clears a single full line', () => {
    const board = createEmptyBoard()
    board[10] = Array(COLS).fill('red')
    const { board: result, linesCleared } = clearLines(board)
    expect(linesCleared).toBe(1)
    expect(result).not.toContainEqual(Array(COLS).fill('red'))
    expect(result[ROWS - 1]).toEqual(Array(COLS).fill(null))
  })

  it('clears multiple full lines', () => {
    const board = createEmptyBoard()
    board[10] = Array(COLS).fill('red')
    board[15] = Array(COLS).fill('blue')
    const { linesCleared } = clearLines(board)
    expect(linesCleared).toBe(2)
  })

  it('does not clear partially filled lines', () => {
    const board = createEmptyBoard()
    board[10][0] = 'red'
    board[10][1] = 'red'
    const { linesCleared } = clearLines(board)
    expect(linesCleared).toBe(0)
  })

  it('preserves non-full lines with row shift', () => {
    const board = createEmptyBoard()
    board[10] = Array(COLS).fill('red')
    board[5][5] = 'blue'
    const { board: result, linesCleared } = clearLines(board)
    expect(linesCleared).toBe(1)
    expect(result[6][5]).toBe('blue')
  })
})

describe('getScore', () => {
  it('returns correct score for 1 line at level 0', () => {
    expect(getScore(1, 0)).toBe(100)
  })

  it('returns correct score for 2 lines at level 0', () => {
    expect(getScore(2, 0)).toBe(600)
  })

  it('returns correct score for 3 lines at level 0', () => {
    expect(getScore(3, 0)).toBe(1500)
  })

  it('returns correct score for 4 lines at level 0', () => {
    expect(getScore(4, 0)).toBe(3200)
  })

  it('multiplies score by (level + 1)', () => {
    expect(getScore(1, 1)).toBe(200)
    expect(getScore(1, 2)).toBe(300)
  })

  it('returns 0 for 0 lines cleared', () => {
    expect(getScore(0, 0)).toBe(0)
  })
})

describe('getGhostPosition', () => {
  const board = createEmptyBoard()
  const piece = PIECES.O

  it('returns the same position when piece is at bottom', () => {
    const ghost = getGhostPosition(board, piece, { x: 0, y: ROWS - 2 })
    expect(ghost).toEqual({ x: 0, y: ROWS - 2 })
  })

  it('returns the bottom position when piece is at top', () => {
    const ghost = getGhostPosition(board, piece, { x: 0, y: 0 })
    expect(ghost.y).toBe(ROWS - 2)
  })

  it('returns correct ghost position at middle', () => {
    const ghost = getGhostPosition(board, piece, { x: 5, y: 5 })
    expect(ghost.x).toBe(5)
    expect(ghost.y).toBe(ROWS - 2)
  })

  it('works for different piece types', () => {
    const piece = PIECES.I
    const ghost = getGhostPosition(board, piece, { x: 3, y: 0 })
    expect(ghost.x).toBe(3)
    expect(ghost.y).toBe(ROWS - 2)
  })
})

describe('spawnPiece', () => {
  it('returns a piece object with required properties', () => {
    const piece = spawnPiece()
    expect(piece).toHaveProperty('type')
    expect(piece).toHaveProperty('matrix')
    expect(piece).toHaveProperty('x')
    expect(piece).toHaveProperty('y')
  })

  it('returns a piece with type from PIECE_TYPES', () => {
    for (let i = 0; i < 10; i++) {
      const piece = spawnPiece()
      expect(PIECE_TYPES).toContain(piece.type)
    }
  })

  it('centers the piece horizontally', () => {
    const piece = spawnPiece()
    const expectedX = Math.floor((COLS - piece.matrix[0].length) / 2)
    expect(piece.x).toBe(expectedX)
  })

  it('spawns at row 0', () => {
    const piece = spawnPiece()
    expect(piece.y).toBe(0)
  })
})

describe('rotateWithKick', () => {
  const board = createEmptyBoard()

  it('rotates the T piece 90 degrees clockwise', () => {
    const result = rotateWithKick(board, PIECES.T, { x: 5, y: 5 })
    expect(result.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ])
  })

  it('rotates the O piece 90 degrees clockwise', () => {
    const result = rotateWithKick(board, PIECES.O, { x: 5, y: 5 })
    expect(result.matrix).toEqual(PIECES.O)
  })

  it('does not rotate when collision occurs at edge', () => {
    const result = rotateWithKick(board, PIECES.T, { x: 0, y: 0 })
    expect(result.matrix).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ])
  })

  it('returns original matrix when rotation is not possible', () => {
    const board = createEmptyBoard()
    board[0][0] = 'red'
    board[0][1] = 'red'
    board[0][2] = 'red'
    board[1][0] = 'red'
    board[1][1] = 'red'
    board[1][2] = 'red'
    board[2][0] = 'red'
    board[2][1] = 'red'
    board[2][2] = 'red'
    const result = rotateWithKick(board, PIECES.T, { x: 0, y: 0 })
    expect(result.matrix).toEqual(PIECES.T)
  })
})

describe('getPieceType', () => {
  it('returns the correct type for I piece', () => {
    expect(getPieceType(PIECES.I)).toBe('I')
  })

  it('returns the correct type for O piece', () => {
    expect(getPieceType(PIECES.O)).toBe('O')
  })

  it('returns the correct type for T piece', () => {
    expect(getPieceType(PIECES.T)).toBe('T')
  })

  it('returns null for unknown matrix', () => {
    expect(getPieceType([[1, 1], [1, 0]])).toBeNull()
  })
})

describe('getFallInterval', () => {
  it('returns BASE_INTERVAL at level 0', () => {
    expect(getFallInterval(0)).toBe(800)
  })

  it('decreases interval as level increases', () => {
    expect(getFallInterval(1)).toBe(730)
    expect(getFallInterval(2)).toBe(660)
  })

  it('returns MIN_INTERVAL at high levels', () => {
    expect(getFallInterval(10)).toBeGreaterThan(MIN_INTERVAL)
    expect(getFallInterval(100)).toBe(MIN_INTERVAL)
  })

  it('never returns below MIN_INTERVAL', () => {
    expect(getFallInterval(1000)).toBe(MIN_INTERVAL)
  })
})

describe('LINES_PER_LEVEL and LINE_SCORES', () => {
  it('has correct LINES_PER_LEVEL', () => {
    expect(LINES_PER_LEVEL).toBe(10)
  })

  it('has correct LINE_SCORES', () => {
    expect(LINE_SCORES).toEqual([0, 100, 300, 500, 800])
  })
})

describe('spawnPiece immutability', () => {
  it('does not mutate the original PIECES matrix when spawning', () => {
    const originalIMatrix = JSON.parse(JSON.stringify(PIECES.I))
    const originalSMatrix = JSON.parse(JSON.stringify(PIECES.S))
    for (let i = 0; i < 10; i++) {
      spawnPiece()
    }
    expect(PIECES.I).toEqual(originalIMatrix)
    expect(PIECES.S).toEqual(originalSMatrix)
  })

  it('returns a new matrix reference on each spawn', () => {
    const piece1 = spawnPiece()
    const piece2 = spawnPiece()
    expect(piece1.matrix).not.toBe(piece2.matrix)
  })
})

describe('mergePiece immutability', () => {
  it('does not mutate the original board', () => {
    const board = createEmptyBoard()
    board[5][5] = 'blue'
    const piece = PIECES.O
    const pos = { x: 0, y: 0 }
    const originalBoard = board.map(row => [...row])
    mergePiece(board, piece, pos, 'red')
    expect(board[5][5]).toBe('blue')
    expect(board).toEqual(originalBoard)
  })
})
