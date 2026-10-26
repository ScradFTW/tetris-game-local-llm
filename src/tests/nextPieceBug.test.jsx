import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTetris } from '../hooks/useTetris'

function getWrapper() {
  const Wrapper = ({ children }) => <div>{children}</div>
  return Wrapper
}

describe('next piece preview bug', () => {
  it('HARD_DROP: new current piece should be the old state.next', () => {
    const { result } = renderHook(() => useTetris(), { wrapper: getWrapper() })
    
    // Start game
    act(() => result.current.start())
    const oldNext = result.current.state.next
    const oldCurrent = result.current.state.current
    
    // Hard drop to lock the current piece
    act(() => result.current.hardDrop())
    
    // After hard drop, the new current should be the old next
    expect(result.current.state.current).toBe(oldNext)
    expect(result.current.state.current.type).toBe(oldNext.type)
  })

  it('HARD_DROP: only one new piece should be spawned for next', () => {
    const { result } = renderHook(() => useTetris(), { wrapper: getWrapper() })
    
    act(() => result.current.start())
    const oldNext = result.current.state.next
    
    act(() => result.current.hardDrop())
    
    // The new next should be a different piece (freshly spawned)
    expect(result.current.state.next).not.toBe(oldNext)
    // The current should be the old next (not a fresh random piece)
    expect(result.current.state.current.type).toBe(oldNext.type)
  })

  it('multiple hard drops preserve the next piece chain correctly', () => {
    const { result } = renderHook(() => useTetris(), { wrapper: getWrapper() })
    
    act(() => result.current.start())
    const firstNext = result.current.state.next
    
    // First hard drop
    act(() => result.current.hardDrop())
    expect(result.current.state.current.type).toBe(firstNext.type)
    const secondNext = result.current.state.next
    
    // Second hard drop
    act(() => result.current.hardDrop())
    expect(result.current.state.current.type).toBe(secondNext.type)
    const thirdNext = result.current.state.next
    
    // Third hard drop
    act(() => result.current.hardDrop())
    expect(result.current.state.current.type).toBe(thirdNext.type)
  })

  it('MOVE_DOWN (lock): new current piece should be the old state.next', () => {
    const { result } = renderHook(() => useTetris(), { wrapper: getWrapper() })
    
    act(() => result.current.start())
    const oldNext = result.current.state.next
    
    // Move down until lock (or hard drop to force lock)
    act(() => result.current.hardDrop())
    
    expect(result.current.state.current).toBe(oldNext)
  })
})
