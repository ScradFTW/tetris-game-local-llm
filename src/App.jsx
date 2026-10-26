import { useEffect } from 'react'
import { useTetris } from './hooks/useTetris'
import { getGhostPosition } from './tetris/engine'
import './App.css'
import Cell from './components/Cell'
import Board from './components/Board'
import GameOver from './components/GameOver'
import NextPiece from './components/NextPiece'
import Controls from './components/Controls'

function App() {
  const { state, start, pause, resume, restart, moveLeft, moveRight, moveDown, rotate, hardDrop } = useTetris()
  const ghost = state.current
    ? { ...getGhostPosition(state.board, state.current.matrix, { x: state.current.x, y: state.current.y }), matrix: state.current.matrix, type: state.current.type }
    : null

  useEffect(() => {
    start()
  }, [start])

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowDown':
          e.preventDefault()
          moveDown()
          break
        case 'ArrowUp':
        case 'x':
        case 'X':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          if (state.status === 'ready' || state.status === 'over') start()
          else hardDrop()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          if (state.status === 'playing') pause()
          else if (state.status === 'paused') resume()
          break
        case 'Enter':
          e.preventDefault()
          if (state.status === 'ready' || state.status === 'over') start()
          else if (state.status === 'paused') resume()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, pause, resume, start, state.status])

  return (
    <div className="tetris">
      <h1>Tetris</h1>
      <div className="game-container">
        <div className="left-panel">
          <NextPiece next={state.next} />
          <div className="stats">
            <div className="stat score">
              <span className="label">Score</span>
              <span className="value">{state.score}</span>
            </div>
            <div className="stat level">
              <span className="label">Level</span>
              <span className="value">{state.level}</span>
            </div>
            <div className="stat lines">
              <span className="label">Lines</span>
              <span className="value">{state.lines}</span>
            </div>
          </div>
        </div>
        
        <div className="board-container">
          <Board board={state.board} current={state.current} ghost={ghost} clearedLines={state.clearedLines} />
          {state.status === 'over' && <GameOver score={state.score} onRestart={restart} />}
        </div>
        
        <div className="right-panel">
          <div className="stat large">
            <span className="label">Status</span>
            <span className="value">{state.status}</span>
          </div>
        </div>
      </div>
      
      <Controls 
        state={state}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onRestart={restart}
      />
    </div>
  )
}

export default App
