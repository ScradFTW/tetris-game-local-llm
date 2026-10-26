function GameOver({ score, onRestart }) {
  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h2>GAME OVER</h2>
        <div className="final-score">
          <span>Score:</span>
          <span>{score}</span>
        </div>
        <button onClick={onRestart}>Play Again</button>
      </div>
    </div>
  )
}

export default GameOver
