import { useEffect, useReducer, useCallback, useRef } from 'react'
import {
  createEmptyBoard,
  collides,
  mergePiece,
  clearLines,
  getScore,
  getGhostPosition,
  spawnPiece,
  rotateWithKick,
  getPieceType,
  getFallInterval,
  LINES_PER_LEVEL,
  LINE_SCORES
} from '../tetris/engine'
import { COLORS } from '../tetris/constants'

const ACTIONS = {
  START: 'START',
  TICK: 'TICK',
  MOVE_LEFT: 'MOVE_LEFT',
  MOVE_RIGHT: 'MOVE_RIGHT',
  MOVE_DOWN: 'MOVE_DOWN',
  ROTATE: 'ROTATE',
  SOFT_DROP: 'SOFT_DROP',
  HARD_DROP: 'HARD_DROP',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  RESTART: 'RESTART',
  CLEAR_ANIMATION: 'CLEAR_ANIMATION',
}

const INITIAL_STATE = {
  board: createEmptyBoard(),
  current: null,
  next: null,
  score: 0,
  level: 0,
  lines: 0,
  status: 'ready', // ready, playing, paused, over
  gameOver: false,
  clearedLines: [],
}

function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START: {
      const board = createEmptyBoard()
      const piece = spawnPiece()
      const next = spawnPiece()
      return {
        ...INITIAL_STATE,
        board,
        current: piece,
        next,
        score: 0,
        level: 0,
        lines: 0,
        status: 'playing',
        gameOver: false,
        clearedLines: [],
      }
    }

    case ACTIONS.RESTART: {
      return { ...INITIAL_STATE, status: 'ready' }
    }

    case ACTIONS.PAUSE: {
      return { ...state, status: 'paused' }
    }

    case ACTIONS.RESUME: {
      if (state.status === 'paused') {
        return { ...state, status: 'playing' }
      }
      return state
    }

    case ACTIONS.CLEAR_ANIMATION: {
      return { ...state, clearedLines: [] }
    }

    case ACTIONS.MOVE_LEFT: {
      if (state.status !== 'playing' || !state.current) return state
      if (!collides(state.board, state.current.matrix, { x: state.current.x - 1, y: state.current.y })) {
        return { ...state, current: { ...state.current, x: state.current.x - 1 } }
      }
      return state
    }

    case ACTIONS.MOVE_RIGHT: {
      if (state.status !== 'playing' || !state.current) return state
      if (!collides(state.board, state.current.matrix, { x: state.current.x + 1, y: state.current.y })) {
        return { ...state, current: { ...state.current, x: state.current.x + 1 } }
      }
      return state
    }

    case ACTIONS.MOVE_DOWN: {
      if (state.status !== 'playing' || !state.current) return state
      const canMove = !collides(state.board, state.current.matrix, { x: state.current.x, y: state.current.y + 1 })
      if (canMove) {
        return { ...state, current: { ...state.current, y: state.current.y + 1 } }
      } else {
        return handleLock(state)
      }
    }

    case ACTIONS.ROTATE: {
      if (state.status !== 'playing' || !state.current) return state
      const result = rotateWithKick(state.board, state.current.matrix, state.current)
      const newPiece = { ...state.current, matrix: result.matrix, x: result.x, y: result.y }
      return { ...state, current: newPiece }
    }

    case ACTIONS.HARD_DROP: {
      if (state.status !== 'playing' || !state.current) return state
      let dropY = state.current.y
      while (!collides(state.board, state.current.matrix, { x: state.current.x, y: dropY + 1 })) {
        dropY++
      }
      const dropDistance = dropY - state.current.y + 1
      const newPiece = { ...state.current, y: dropY }
      
      const { board: mergedBoard, linesCleared, clearedLineIndices } = clearLines(mergePiece(state.board, newPiece.matrix, { x: newPiece.x, y: newPiece.y }, COLORS[newPiece.type]))
      const scoreIncrease = getScore(linesCleared, state.level) + dropDistance * 2
      const newLines = state.lines + linesCleared
      const newLevel = Math.floor(newLines / LINES_PER_LEVEL)
      const newScore = state.score + scoreIncrease

      const newNext = spawnPiece()
      const ghost = getGhostPosition(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 })

      return {
        ...state,
        board: mergedBoard,
        current: state.next,
        next: newNext,
        score: newScore,
        level: newLevel,
        lines: newLines,
        gameOver: collides(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 }),
        status: collides(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 }) ? 'over' : 'playing',
        clearedLines: clearedLineIndices || [],
      }
    }

    case ACTIONS.TICK: {
      if (state.status !== 'playing' || !state.current) return state
      
      const canMoveDown = !collides(state.board, state.current.matrix, { x: state.current.x, y: state.current.y + 1 })
      if (canMoveDown) {
        return { ...state, current: { ...state.current, y: state.current.y + 1 } }
      } else {
        return handleLock(state)
      }
    }

    default:
      return state
  }
}

function handleLock(state) {
  const piece = state.current
  const { board: mergedBoard, linesCleared, clearedLineIndices } = clearLines(mergePiece(state.board, piece.matrix, { x: piece.x, y: piece.y }, COLORS[piece.type]))
  const scoreIncrease = getScore(linesCleared, state.level)
  const newLines = state.lines + linesCleared
  const newLevel = Math.floor(newLines / LINES_PER_LEVEL)
  const newScore = state.score + scoreIncrease

  const newNext = spawnPiece()
  const ghost = getGhostPosition(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 })

  return {
    ...state,
    board: mergedBoard,
    current: state.next,
    next: newNext,
    score: newScore,
    level: newLevel,
    lines: newLines,
    gameOver: collides(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 }),
    status: collides(mergedBoard, state.next.matrix, { x: state.next.x, y: 0 }) ? 'over' : 'playing',
    clearedLines: clearedLineIndices || [],
  }
}

export function useTetris() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const fallIntervalRef = useRef(null)

  useEffect(() => {
    if (state.clearedLines && state.clearedLines.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_ANIMATION' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [state.clearedLines])

  const tick = useCallback(() => {
    if (state.status === 'playing' && state.current) {
      dispatch({ type: ACTIONS.TICK })
    }
  }, [state.status, state.current])

  useEffect(() => {
    if (state.status === 'playing' && state.current) {
      fallIntervalRef.current = setInterval(tick, getFallInterval(state.level))
    } else {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
        fallIntervalRef.current = null
      }
    }
    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
      }
    }
  }, [state.status, state.current, tick, state.level])

  const start = useCallback(() => {
    console.log('START called, dispatching START action')
    dispatch({ type: ACTIONS.START })
    console.log('START action dispatched')
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: ACTIONS.PAUSE })
  }, [])

  const resume = useCallback(() => {
    dispatch({ type: ACTIONS.RESUME })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: ACTIONS.RESTART })
  }, [])

  const moveLeft = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: ACTIONS.MOVE_LEFT })
  }, [state.status])

  const moveRight = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: ACTIONS.MOVE_RIGHT })
  }, [state.status])

  const moveDown = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: ACTIONS.MOVE_DOWN })
  }, [state.status])

  const rotate = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: ACTIONS.ROTATE })
  }, [state.status])

  const hardDrop = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: ACTIONS.HARD_DROP })
  }, [state.status])

  return {
    state,
    start,
    pause,
    resume,
    restart,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  }
}
