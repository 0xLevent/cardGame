import { useState, useEffect } from "react";

// Card images
const cardImages = [
  "/images/img.png", "/images/img2.png", "/images/img3.png", "/images/img4.png", 
  "/images/img5.png", "/images/img66.png", "/images/img7.png", "/images/img8.png", "/images/img9.png"
];

// Ses efektleri
const CARD_FLIP_SOUND = new Audio("/sounds/card-flip.mp3");
const MATCH_SOUND = new Audio("/sounds/match.mp3");
const VICTORY_SOUND = new Audio("/sounds/vvictory.mp3");

// Ses çalma fonksiyonu
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
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Preload all images when component mounts
  useEffect(() => {
    const preloadImages = () => {
      const imagePromises = cardImages.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      Promise.all(imagePromises)
        .then(() => {
          setImagesLoaded(true);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error preloading images:", error);
          setLoading(false);
        });
    };

    preloadImages();
    
    // Preload sounds
    CARD_FLIP_SOUND.load();
    MATCH_SOUND.load();
    VICTORY_SOUND.load();
  }, []);

  useEffect(() => {
    // Check if all cards are matched (game complete)
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
        // Eşleşen kartları işaretle ve eşleşme sesi çal
        playSound(MATCH_SOUND);
        
        setCards(prev => prev.map(card =>
          card.id === first || card.id === second ? { ...card, matched: true } : card
        ));
        setSelected([]);
        setDisabled(false);
      } else {
        // Eşleşmeyen kartlar - daha hızlı kapat (500ms)
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
      // Kart çevirme sesi çal
      playSound(CARD_FLIP_SOUND);
      
      // Increment move counter on every card click
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Game Loading...</p>
      </div>
    );
  }

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
                  loading="eager"
                  width="85"
                  height="100"
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
