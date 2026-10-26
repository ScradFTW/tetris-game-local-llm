function Controls({ state, onStart, onPause, onResume, onRestart }) {
  const getStatusText = () => {
    switch (state.status) {
      case 'ready': return 'Press ENTER to Start'
      case 'paused': return 'Paused'
      case 'over': return 'Game Over - Press ENTER to Restart'
      case 'playing': return 'Playing'
      default: return ''
    }
  }

  return (
    <div className="controls">
      <div className="status-text">{getStatusText()}</div>
      <div className="key-hints">
        <span>← →</span>
        <span>↓</span>
        <span>↑/X</span>
        <span>Space</span>
        <span>P</span>
      </div>
      <div className="button-hints">
        <button onClick={onStart} disabled={state.status === 'playing'}>Start</button>
        <button onClick={onPause} disabled={state.status !== 'playing'}>Pause</button>
        <button onClick={onRestart} disabled={state.status !== 'ready' && state.status !== 'over'}>Restart</button>
      </div>
    </div>
  )
}

export default Controls
