export const COLS = 10
export const ROWS = 20

// Standard SRS-style tetromino definitions as matrices.
// Each value is a 2D grid of 0/1.
export const PIECES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

export const COLORS = {
  I: '#22d3ee',
  O: '#facc15',
  T: '#a78bfa',
  S: '#4ade80',
  Z: '#f87171',
  J: '#60a5fa',
  L: '#fb923c',
}

export const PIECE_TYPES = Object.keys(PIECES)

// Base fall interval (ms) at level 0, and how it shrinks per level.
export const BASE_INTERVAL = 800
export const MIN_INTERVAL = 80
export const LEVEL_INTERVAL_STEP = 70
export const LINES_PER_LEVEL = 10

// Points per lines cleared, multiplied by (level + 1).
export const LINE_SCORES = [0, 100, 300, 500, 800]
