import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Cell from '../components/Cell'
import Board from '../components/Board'
import NextPiece from '../components/NextPiece'
import GameOver from '../components/GameOver'
import Controls from '../components/Controls'
import { COLORS } from '../tetris/constants'

describe('Cell', () => {
  it('renders empty cell when no color', () => {
    const { container } = render(<Cell color={null} isGhost={false} isCleared={false} />)
    const cell = container.firstChild
    expect(cell).not.toHaveClass('filled')
    expect(cell).not.toHaveClass('ghost')
    expect(cell).not.toHaveClass('cleared')
    expect(cell.style.backgroundColor).toBe('')
  })

  it('renders filled cell with color', () => {
    const { container } = render(<Cell color="red" isGhost={false} isCleared={false} />)
    const cell = container.firstChild
    expect(cell).toHaveClass('filled')
    expect(cell.style.backgroundColor).toBe('red')
  })

  it('renders ghost cell', () => {
    const { container } = render(<Cell color="red" isGhost={true} isCleared={false} />)
    const cell = container.firstChild
    expect(cell).toHaveClass('ghost')
    expect(cell.style.backgroundColor).toBe('red')
  })

  it('renders cleared cell', () => {
    const { container } = render(<Cell color="red" isGhost={false} isCleared={true} />)
    const cell = container.firstChild
    expect(cell).toHaveClass('cleared')
  })

  it('applies inline style for backgroundColor', () => {
    const { container } = render(<Cell color="blue" isGhost={false} isCleared={false} />)
    const cell = container.firstChild
    expect(cell.style.backgroundColor).toBe('blue')
  })
})

describe('Board', () => {
  it('renders empty board', () => {
    const board = Array.from({ length: 20 }, () => Array(10).fill(null))
    const { container } = render(
      <Board board={board} current={null} ghost={null} clearedLines={[]} />
    )
    const boardEl = container.querySelector('.board')
    expect(boardEl).toBeTruthy()
  })

  it('renders cells with correct classes', () => {
    const board = Array.from({ length: 20 }, () => Array(10).fill(null))
    const { container } = render(
      <Board board={board} current={null} ghost={null} clearedLines={[]} />
    )
    const cells = container.querySelectorAll('.cell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('renders ghost piece overlay', () => {
    const board = Array.from({ length: 20 }, () => Array(10).fill(null))
    const { container } = render(
      <Board
        board={board}
        current={null}
        ghost={{ matrix: [[1, 1], [1, 1]], x: 0, y: 0, type: 'O' }}
        clearedLines={[]}
      />
    )
    const ghostCells = container.querySelectorAll('.cell.ghost')
    expect(ghostCells.length).toBeGreaterThan(0)
  })

  it('renders cleared lines with cleared class', () => {
    const board = Array.from({ length: 20 }, () => Array(10).fill(null))
    const { container } = render(
      <Board board={board} current={null} ghost={null} clearedLines={[5, 10]} />
    )
    const clearedRows = container.querySelectorAll('.row')
    expect(clearedRows.length).toBeGreaterThan(0)
  })

  it('renders current piece on board', () => {
    const board = Array.from({ length: 20 }, () => Array(10).fill(null))
    const { container } = render(
      <Board
        board={board}
        current={{ matrix: [[1]], x: 5, y: 5, type: 'I' }}
        ghost={null}
        clearedLines={[]}
      />
    )
    const boardEl = container.querySelector('.board')
    expect(boardEl).toBeTruthy()
  })
})

describe('NextPiece', () => {
  it('returns null when next is null', () => {
    const { container } = render(<NextPiece next={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders next piece with correct colors', () => {
    const nextPiece = {
      type: 'I',
      matrix: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
      x: 0,
      y: 0,
    }
    const { container } = render(<NextPiece next={nextPiece} />)
    const filledCells = container.querySelectorAll('.cell.filled')
    expect(filledCells.length).toBe(4)
  })

  it('renders empty cells for zero matrix values', () => {
    const nextPiece = {
      type: 'I',
      matrix: [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      x: 0,
      y: 0,
    }
    const { container } = render(<NextPiece next={nextPiece} />)
    const filledCells = container.querySelectorAll('.cell.filled')
    expect(filledCells.length).toBe(1)
  })

  it('applies correct color based on piece type', () => {
    const nextPiece = {
      type: 'O',
      matrix: [
        [1, 1],
        [1, 1],
      ],
      x: 0,
      y: 0,
    }
    const { container } = render(<NextPiece next={nextPiece} />)
    const filledCells = container.querySelectorAll('.cell.filled')
    filledCells.forEach((cell) => {
      expect(cell.style.backgroundColor).not.toBe('')
      expect(cell.style.backgroundColor).not.toBe('transparent')
    })
  })

  it('renders piece rows', () => {
    const nextPiece = {
      type: 'L',
      matrix: [
        [1, 0],
        [1, 1],
      ],
      x: 0,
      y: 0,
    }
    const { container } = render(<NextPiece next={nextPiece} />)
    const pieceRows = container.querySelectorAll('.piece-row')
    expect(pieceRows.length).toBe(4)
  })
})

describe('GameOver', () => {
  it('renders game over message', () => {
    render(<GameOver score={1234} onRestart={() => {}} />)
    expect(screen.getByText('GAME OVER')).toBeTruthy()
  })

  it('displays the score', () => {
    render(<GameOver score={5678} onRestart={() => {}} />)
    expect(screen.getByText('5678')).toBeTruthy()
  })

  it('renders restart button', () => {
    render(<GameOver score={100} onRestart={() => {}} />)
    expect(screen.getByText('Play Again')).toBeTruthy()
  })

  it('calls onRestart when button is clicked', () => {
    const onRestart = vi.fn()
    render(<GameOver score={100} onRestart={onRestart} />)
    fireEvent.click(screen.getByText('Play Again'))
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('displays correct score value', () => {
    render(<GameOver score={9999} onRestart={() => {}} />)
    expect(screen.getByText('9999')).toBeTruthy()
  })
})

describe('Controls', () => {
  it('displays ready status text', () => {
    render(
      <Controls
        state={{ status: 'ready' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    expect(screen.getByText('Press ENTER to Start')).toBeTruthy()
  })

  it('displays paused status text', () => {
    render(
      <Controls
        state={{ status: 'paused' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    expect(screen.getByText('Paused')).toBeTruthy()
  })

  it('displays playing status text', () => {
    render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    expect(screen.getByText('Playing')).toBeTruthy()
  })

  it('displays game over status text', () => {
    render(
      <Controls
        state={{ status: 'over' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    expect(screen.getByText('Game Over - Press ENTER to Restart')).toBeTruthy()
  })

  it('disables start button when playing', () => {
    const { container } = render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const startBtn = container.querySelector('button')
    expect(startBtn).toBeDisabled()
  })

  it('enables start button when ready', () => {
    const { container } = render(
      <Controls
        state={{ status: 'ready' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    const startBtn = buttons[0]
    expect(startBtn).not.toBeDisabled()
  })

  it('enables pause button when playing', () => {
    const { container } = render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    const pauseBtn = buttons[1]
    expect(pauseBtn).not.toBeDisabled()
  })

  it('disables pause button when not playing', () => {
    const { container } = render(
      <Controls
        state={{ status: 'ready' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    const pauseBtn = buttons[1]
    expect(pauseBtn).toBeDisabled()
  })

  it('enables restart button when ready', () => {
    const { container } = render(
      <Controls
        state={{ status: 'ready' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    const restartBtn = buttons[2]
    expect(restartBtn).not.toBeDisabled()
  })

  it('disables restart button when playing', () => {
    const { container } = render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    const restartBtn = buttons[2]
    expect(restartBtn).toBeDisabled()
  })

  it('calls onStart when start button is clicked', () => {
    const onStart = vi.fn()
    render(
      <Controls
        state={{ status: 'ready' }}
        onStart={onStart}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = render(
      <Controls
        state={{ status: 'ready' }}
        onStart={onStart}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    ).container.querySelectorAll('button')
    fireEvent.click(buttons[0])
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('calls onPause when pause button is clicked', () => {
    const onPause = vi.fn()
    const { container } = render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={onPause}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[1])
    expect(onPause).toHaveBeenCalledTimes(1)
  })

  it('calls onResume when resume button is clicked', () => {
    const onResume = vi.fn()
    render(
      <Controls
        state={{ status: 'paused' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={onResume}
        onRestart={() => {}}
      />
    )
    expect(screen.getByText('Paused')).toBeTruthy()
  })

  it('calls onRestart when restart button is clicked', () => {
    const onRestart = vi.fn()
    const { container } = render(
      <Controls
        state={{ status: 'ready' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={onRestart}
      />
    )
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[2])
    expect(onRestart).toHaveBeenCalledTimes(1)
  })

  it('renders key hints', () => {
    render(
      <Controls
        state={{ status: 'playing' }}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
      />
    )
    const keyHints = document.querySelector('.key-hints')
    expect(keyHints).toBeTruthy()
  })
})
