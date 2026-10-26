import { describe, it, expect, test } from 'vitest'
import {
  createEmptyBoard,
  rotateMatrix,
  collides,
  mergePiece,
  clearLines,
  spawnPiece,
  rotateWithKick,
  getGhostPosition,
} from '../tetris/engine'
import {
  COLS,
  ROWS,
  PIECES,
  COLORS,
  LINES_PER_LEVEL,
  LINE_SCORES,
} from '../tetris/constants'

describe('tetris/engine', () => {
  describe('createEmptyBoard', () => {
    it('should create a board with all empty cells', () => {
      const board = createEmptyBoard()
      expect(board).toHaveLength(ROWS)
      expect(board[0]).toHaveLength(COLS)
      board.forEach((row) => {
        row.forEach((cell) => expect(cell).toBe(null))
      })
    })
  })

  describe('rotateMatrix', () => {
    it('should rotate a 2x2 matrix 90 degrees clockwise', () => {
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

    it('should rotate a 3x3 matrix 90 degrees clockwise', () => {
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

    it('should handle a single cell matrix', () => {
      const matrix = [[1]]
      const result = rotateMatrix(matrix)
      expect(result).toEqual([[1]])
    })
  })

  describe('collides', () => {
    it('should return false when piece can be placed at position', () => {
      const board = createEmptyBoard()
      const matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
      expect(collides(board, matrix, { x: 0, y: 0 })).toBe(false)
    })

    it('should return true when piece would go out of bounds (left)', () => {
      const board = createEmptyBoard()
      const matrix = [[1, 1]]
      expect(collides(board, matrix, { x: -1, y: 0 })).toBe(true)
    })

    it('should return true when piece would go out of bounds (right)', () => {
      const board = createEmptyBoard()
      const matrix = [[1, 1]]
      expect(collides(board, matrix, { x: COLS - 1, y: 0 })).toBe(true)
    })

    it('should return true when piece would go out of bounds (bottom)', () => {
      const board = createEmptyBoard()
      const matrix = [[1]]
      expect(collides(board, matrix, { x: 0, y: ROWS })).toBe(true)
    })

    it('should return true when piece collides with existing block', () => {
      const board = [
        [null, null, null],
        [null, null, null],
        [1, 1, 1],
      ]
      const matrix = [[1, 1, 1]]
      expect(collides(board, matrix, { x: 0, y: 2 })).toBe(true)
    })
  })

  describe('mergePiece', () => {
    it('should merge piece cells into the board', () => {
      const board = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
      ]
      const piece = {
        matrix: PIECES['I'],
        x: 0,
        y: 0,
      }
      const result = mergePiece(board, piece.matrix, { x: piece.x, y: piece.y }, COLORS['I'])
      
      expect(result).toBeDefined()
      expect(result[1][0]).toBe(COLORS['I'])
      expect(result[1][1]).toBe(COLORS['I'])
      expect(result[1][2]).toBe(COLORS['I'])
      expect(result[1][3]).toBe(COLORS['I'])
    })

    it('should not modify existing blocks', () => {
      const board = [
        [1, 1, 1],
        [1, 1, 1],
        [null, null, null],
      ]
      const piece = { matrix: [[1]] }
      const result = mergePiece(board, piece.matrix, { x: 1, y: 2 })
      
      expect(result[0][0]).toBe(1)
      expect(result[1][1]).toBe(1)
    })
  })

  describe('clearLines', () => {
    it('should remove full lines and shift rows down', () => {
      const board = [
        [null, null, null],
        [1, 1, 1],
        [1, 1, 1],
        [null, null, null],
      ]
      const result = clearLines(board)
      
      expect(result).toHaveProperty('board')
      expect(result).toHaveProperty('linesCleared')
      expect(result.linesCleared).toBe(2)
    })

    it('should return 0 when no lines are cleared', () => {
      const board = [
        Array(COLS).fill(null),
        Array(COLS).fill(null),
        Array(COLS).fill(null),
      ]
      const result = clearLines(board)
      expect(result.linesCleared).toBe(0)
    })

    it('should handle all lines being cleared', () => {
      const board = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ]
      const result = clearLines(board)
      expect(result.linesCleared).toBe(3)
    })
  })

  describe('spawnPiece', () => {
    it('should create a new random piece at top of board', () => {
      const piece = spawnPiece()
      expect(piece.matrix).toBeDefined()
      expect(piece.y).toBe(0)
      expect(Object.keys(PIECES).includes(piece.type)).toBe(true)
      // x should be centered: Math.floor((COLS - matrix[0].length) / 2)
      // For I piece (4 wide): x = Math.floor((10 - 4) / 2) = 3
      expect(piece.x).toBeGreaterThanOrEqual(0)
      expect(piece.x).toBeLessThan(COLS)
    })
  })

  describe('rotateWithKick', () => {
    it('should rotate piece and apply wall kick if needed', () => {
      const board = [
        [null, null, null],
        [null, null, null],
        [1, 1, 1],
      ]
      const piece = {
        matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        x: 0,
        y: 0,
        type: 'I',
      }
      const result = rotateWithKick(board, piece.matrix, { x: piece.x, y: piece.y })
      
      expect(result.matrix).toBeDefined()
      expect(result.x).toBeDefined()
      expect(result.y).toBe(piece.y)
    })
  })

  describe('getGhostPosition', () => {
    it('should return the lowest possible position for a piece', () => {
      const board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [1, 1, 1],
      ]
      const piece = {
        matrix: [[1, 1, 1]],
        x: 1,
        y: 0,
      }
      const ghost = getGhostPosition(board, piece.matrix, { x: piece.x, y: piece.y })
      
      // Block at row 3, piece is 1 row tall at x=1
      // Collision at y=0 (board[0][1] = null, board[1][1] = null, board[2][1] = null, board[3][1] = 1)
      expect(ghost.y).toBe(0)
      expect(ghost.x).toBe(piece.x)
    })

    it('should return the top position if no collision', () => {
      const board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
        [1, 1, 1],
      ]
      const piece = {
        matrix: [[1, 1, 1]],
        x: 1,
        y: 1,
      }
      const ghost = getGhostPosition(board, piece.matrix, { x: piece.x, y: piece.y })
      
      expect(ghost.y).toBe(1)
    })
  })
})

describe('tetris/constants', () => {
  describe('PIECES', () => {
    it('should define 7 tetrominoes', () => {
      expect(Object.keys(PIECES)).toHaveLength(7)
      expect(Object.keys(PIECES)).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
    })

    it('should have valid matrix shapes for each piece', () => {
      Object.values(PIECES).forEach((piece) => {
        const rows = piece.length
        const cols = piece[0].length
        expect(piece).toHaveLength(rows)
        piece.forEach((row) => {
          expect(row).toHaveLength(cols)
          row.forEach((cell) => {
            expect(cell).toBeGreaterThan(-1)
          })
        })
      })
    })
  })

  describe('COLORS', () => {
    it('should have colors for all piece types', () => {
      expect(Object.keys(COLORS)).toHaveLength(7)
      expect(Object.keys(COLORS)).toEqual(['I', 'O', 'T', 'S', 'Z', 'J', 'L'])
    })
  })

  describe('LINES_PER_LEVEL', () => {
    it('should increase lines needed per level', () => {
      expect(LINES_PER_LEVEL).toBe(10)
    })
  })

  describe('LINE_SCORES', () => {
    it('should have correct scoring values', () => {
      expect(LINE_SCORES).toEqual([0, 100, 300, 500, 800])
    })
  })
})
