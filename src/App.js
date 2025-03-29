import { useState, useEffect } from "react";

const cardImages = [
  "/images/img.png", "/images/img2.png", "/images/img3.png", "/images/img4.png", 
  "/images/img5.png", "/images/img66.png", "/images/img7.png", "/images/img8.png", "/images/img9.png"
];

const CARD_FLIP_SOUND = new Audio("/sounds/acclick.mp3");
const MATCH_SOUND = new Audio("/sounds/match.mp3");
const VICTORY_SOUND = new Audio("/sounds/vvictory.mp3");

const playSound = (sound) => {
  sound.currentTime = 0;
  sound.play().catch(err => console.log("Ses çalma hatası:", err));
};

const shuffledCards = () => {
  const doubled = [...cardImages, ...cardImages]
    .sort(() => Math.random() - 0.5)
    .map((image, index) => ({ id: index, image, flipped: false, matched: false }));
  return doubled;
};

function App() {
  const [cards, setCards] = useState(shuffledCards);
  const [selected, setSelected] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    if (cards.every(card => card.matched) && cards.length > 0) {
      setGameComplete(true);
      playSound(VICTORY_SOUND);
    }
  }, [cards]);

  useEffect(() => {
    if (selected.length === 2) {
      setDisabled(true);
      const [first, second] = selected;
      
      if (cards[first].image === cards[second].image) {
        playSound(MATCH_SOUND);
        
        setCards(prev => prev.map(card =>
          card.id === first || card.id === second ? { ...card, matched: true } : card
        ));
        setSelected([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, flipped: false } : card
          ));
          setSelected([]);
          setDisabled(false);
        }, 500);
      }
    }
  }, [selected, cards]);

  const handleClick = (index) => {
    if (!disabled && !cards[index].flipped && !cards[index].matched && selected.length < 2) {
      playSound(CARD_FLIP_SOUND);
      
      setMoves(prev => prev + 1);
      
      setCards(prev => prev.map((card, i) =>
        i === index ? { ...card, flipped: true } : card
      ));
      setSelected([...selected, index]);
    }
  };

  const restartGame = () => {
    setCards(shuffledCards);
    setSelected([]);
    setDisabled(false);
    setMoves(0);
    setGameComplete(false);
  };

  return (
    <div className="game-container">
      <h1 className="game-title">Tectra Memory Game</h1>
      
      <div className="game-stats">
        <span className="move-counter">Moves: {moves}</span>
      </div>
      
      <div className={`card-grid ${gameComplete ? "game-complete" : ""}`}>
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className={`card-container ${card.matched ? "matched" : ""}`}
            onClick={() => handleClick(index)}
          >
            <div className={`card ${card.flipped || card.matched ? "flipped" : ""}`}>
              {card.flipped || card.matched ? (
                <img 
                  src={card.image} 
                  alt="card" 
                  className={`card-image ${card.matched ? "matched-image" : ""}`} 
                />
              ) : (
                <div className="card-back">❓</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {gameComplete && (
        <div className="victory-message">
          <h2>Congratulations!</h2>
          <p>You completed the game in {moves} moves</p>
        </div>
      )}
      
      <button className="restart-button" onClick={restartGame}>
        Restart
      </button>
    </div>
  );
}

export default App;