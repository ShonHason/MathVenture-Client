import React, { useState, useEffect, useRef } from "react";

const MathMiniGame = () => {
  // Existing states
  const [gameState, setGameState] = useState("menu");
  const [currentQuestion, setCurrentQuestion] = useState({
    num1: 0,
    num2: 0,
    operator: "+",
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [leaderboard, setLeaderboard] = useState([
    { name: "דן", score: 150, difficulty: "easy" },
    { name: "שון", score: 120, difficulty: "medium" },
    { name: "רועי", score: 200, difficulty: "hard" },
    { name: "רותם", score: 90, difficulty: "easy" },
  ]);

  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [showConfetti, setShowConfetti] = useState(false);

  // Audio References TODO
  const backgroundMusicRef = useRef(new Audio("/sounds/background_music.mp3"));
  const correctSFXRef = useRef(new Audio("/sounds/correct_answer.mp3"));
  const incorrectSFXRef = useRef(new Audio("/sounds/incorrect_answer.mp3"));
  const buttonClickSFXRef = useRef(new Audio("/sounds/button_click.mp3"));
  const gameOverSFXRef = useRef(new Audio("/sounds/game_over.mp3"));
  const timerLowSFXRef = useRef(new Audio("/sounds/timer_low.mp3")); // For last 10 seconds

  // --- Utility Functions for Sounds ---
  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current
        .play()
        .catch((e) => console.error("Error playing sound:", e));
    }
  };

  const stopSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // --- EFFECTS ---

  // Timer effect
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (gameState === "playing") {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
          if (timeLeft === 11) {
            // Play low timer sound when 10 seconds left
            playSound(timerLowSFXRef);
          }
        }, 1000);
      } else {
        endGame();
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // Background music control
  useEffect(() => {
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3; // Lower volume for background music

    if (gameState === "playing" || gameState === "menu") {
      playSound(backgroundMusicRef);
    } else {
      stopSound(backgroundMusicRef);
    }

    return () => stopSound(backgroundMusicRef); // Cleanup on unmount
  }, [gameState]);

  // Feedback animation cleanup
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 700); // Clear feedback after 700ms
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Confetti cleanup
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000); // Confetti for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // --- GAME LOGIC (with SFX additions) ---

  const generateQuestion = (difficulty: string) => {
    const operators = ["+", "-", "×"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1, num2;
    if (difficulty === "easy") {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === "medium") {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
    } else {
      // hard
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
    }

    // Ensure subtraction doesn't result in negative numbers
    if (operator === "-" && num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    return { num1, num2, operator };
  };

  const calculateAnswer = (question: {
    num1: any;
    num2: any;
    operator: any;
  }) => {
    const { num1, num2, operator } = question;
    switch (operator) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "×":
        return num1 * num2;
      default:
        return 0;
    }
  };

  const startGame = () => {
    if (!playerName.trim()) {
      alert("אנא הכנס שם לפני תחילת המשחק");
      return;
    }
    playSound(buttonClickSFXRef); // Play sound on game start
    setGameState("playing");
    setScore(0);
    setTimeLeft(60);
    setUserAnswer("");
    setCurrentQuestion(generateQuestion(difficulty));
  };

  const submitAnswer = () => {
    if (!userAnswer) return; // Prevent submitting empty answer
    playSound(buttonClickSFXRef); // Play sound on submit
    const correctAnswer = calculateAnswer(currentQuestion);
    const userNum = parseInt(userAnswer);

    if (userNum === correctAnswer) {
      const points =
        difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
      setScore((prevScore) => prevScore + points); // Use functional update
      setFeedback("correct");
      playSound(correctSFXRef);
    } else {
      setFeedback("incorrect");
      playSound(incorrectSFXRef);
    }

    setUserAnswer("");
    setCurrentQuestion(generateQuestion(difficulty));
  };

  const endGame = () => {
    playSound(gameOverSFXRef); // Play game over sound
    stopSound(backgroundMusicRef); // Stop background music on game over
    setGameState("gameOver");

    // Add to leaderboard
    const newEntry = {
      name: playerName,
      score: score,
      difficulty: difficulty,
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setLeaderboard(updatedLeaderboard);

    // Show confetti if high score or good performance
    if (score > 100 || updatedLeaderboard[0]?.name === playerName) {
      setShowConfetti(true);
    }
  };

  const resetGame = () => {
    playSound(buttonClickSFXRef); // Play sound on reset
    setGameState("menu");
    setScore(0);
    setTimeLeft(60);
    setUserAnswer("");
    setShowConfetti(false); // Hide confetti
  };

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  const baseButtonStyle = {
    padding: "12px 25px",
    fontSize: "18px",
    border: "none",
    borderRadius: "25px", // More rounded
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s ease-in-out", // Smooth transitions
    boxShadow: "0 4px 6px rgba(98, 6, 138, 0.1)",
    margin: "5px",
  };

  const primaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#45B57D",
    color: "white",
    "&:hover": {
      backgroundColor: "#45a049",
      transform: "translateY(-2px)",
    },
  };

  const secondaryButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#4A90E2",
    color: "white",
    "&:hover": {
      backgroundColor: "#367bc8",
      transform: "translateY(-2px)",
    },
  };

  const dangerButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: "#f44336",
    color: "white",
    "&:hover": {
      backgroundColor: "#d32f2f",
      transform: "translateY(-2px)",
    },
  };

  const textInputStyle = {
    padding: "15px",
    fontSize: "24px",
    border: "2px solidrgb(61, 2, 71)",
    borderRadius: "15px", // More rounded input
    textAlign: "center" as const,
    width: "200px", // Wider input
    marginBottom: "20px",
    outline: "none", // Remove default focus outline
    boxShadow: "0 2px 4px rgba(0,0,0,0.08) inset",
    transition: "border-color 0.2s ease-in-out",
    "&:focus": {
      borderColor: "#7B68EE", // Highlight on focus
    },
  };

  const questionBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent white
    padding: "40px",
    borderRadius: "20px", // More rounded
    marginBottom: "30px",
    border: "3px solidrgb(78, 6, 94)", // Thicker border
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    animation: feedback
      ? feedback === "correct"
        ? "pulseGreen 0.5s"
        : "pulseRed 0.5s"
      : "none",
    position: "relative",
    overflow: "hidden", // For particle effects if added
  };

  const gameContainerStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Modern font
    backgroundColor: "#7f39fa", // Light blue background
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    textAlign: "center",
    direction: "rtl",
    position: "relative",
    backgroundImage: `url('/images/game_background.jpg')`, // Example background image
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#333",
    overflow: "hidden", // Ensure confetti doesn't spill
  };

  // Pulse animations (would be in a CSS file normally)
  const pulseGreen = `
    @keyframes pulseGreen {
      0% { transform: scale(1); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
      50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(76, 175, 80, 0.6); }
      100% { transform: scale(1); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    }
  `;

  const pulseRed = `
    @keyframes pulseRed {
      0% { transform: scale(1); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
      50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(244, 67, 54, 0.6); }
      100% { transform: scale(1); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
    }
  `;

  // Dynamic Styles
  const timerStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: timeLeft <= 10 ? "#f44336" : "#4A90E2", // Red if low time
    animation: timeLeft <= 10 ? "blink 1s infinite" : "none",
  };

  // Blink animation
  const blink = `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;

  const globalStyles = `
    ${pulseGreen}
    ${pulseRed}
    ${blink}
    button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }
    input:focus {
        border-color: #7B68EE;
        box-shadow: 0 0 8px rgba(123, 104, 238, 0.4);
    }
    .question-feedback {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 80px;
        font-weight: bold;
        opacity: 0;
        animation: fadeAndScale 0.7s forwards;
    }
    .correct { color: #4CAF50; }
    .incorrect { color: #f44336; }

    @keyframes fadeAndScale {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
    }
    .confetti-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        background-image: url('/images/confetti.gif'); /* Replace with actual GIF path */
        background-size: cover;
        background-position: center;
        opacity: 0.8;
    }
  `;

  if (gameState === "menu") {
    return (
      <div
        className="math-game"
        style={gameContainerStyle as React.CSSProperties}
      >
        <style>{globalStyles}</style>
        <h2
          style={{
            color: "#fffffd",
            marginBottom: "30px",
            fontSize: "3em",
            textShadow: "2px 2px 4px rgba(255, 255, 255, 0.2)",
          }}
        >
          MathVanture Challenge
        </h2>
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "1.2em",
              color: "#fffffd",
            }}
          >
            שם השחקן:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{
              ...textInputStyle,
              width: "250px", // Slightly wider for menu
              borderColor: playerName.trim() ? "#4A90E2" : "#f44336", // Visual cue for empty name
            }}
            placeholder="הכנס את שמך"
          />
        </div>
        <div style={{ marginBottom: "40px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "15px",
              fontWeight: "bold",
              fontSize: "1.2em",
              color: "#fffffd",
            }}
          >
            רמת קושי:
          </label>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "15px" }}
          >
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  playSound(buttonClickSFXRef);
                }}
                style={{
                  ...baseButtonStyle,
                  padding: "15px 30px", // Larger buttons
                  backgroundColor: difficulty === level ? "#45B57D" : "white", // More distinct selection color
                  color: difficulty === level ? "white" : "#7B68EE",
                  border: `2px solid ${
                    difficulty === level ? "#7B68EE" : "#B0C4DE"
                  }`,
                }}
              >
                {level === "easy"
                  ? "קל ⭐"
                  : level === "medium"
                  ? "בינוני 🚀"
                  : "קשה 💀"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={startGame}
          style={{
            ...primaryButtonStyle,
            padding: "20px 40px",
            fontSize: "22px",
            marginBottom: "40px",
            color: "#fffffd",
          }}
          disabled={!playerName.trim()} // Disable if no player name
        >
          התחל משחק!
        </button>
        {/* Leaderboard */}
        <div style={{ maxWidth: "450px", margin: "0 auto", width: "100%" }}>
          <h3
            style={{
              color: "#fffffd",
              marginBottom: "20px",
              fontSize: "1.8em",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            🏆 לוח תוצאות 🏆
          </h3>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "15px",
              padding: "20px",
              border: "1px solid #e9ecef",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: index < 4 ? "1px dashed #e9ecef" : "none", // Dashed border
                  fontSize: "1.1em",
                  color: "#444",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`}{" "}
                  {entry.name}
                </span>
                <span style={{ fontSize: "0.9em", color: "#666" }}>
                  {entry.score} נקודות (
                  {entry.difficulty === "easy"
                    ? "קל"
                    : entry.difficulty === "medium"
                    ? "בינוני"
                    : "קשה"}
                  )
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div className="math-game" style={gameContainerStyle}>
        <style>{globalStyles}</style> {/* Apply global styles */}
        {showConfetti && <div className="confetti-overlay"></div>}{" "}
        {/* Confetti overlay */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "80%",
            maxWidth: "600px",
            marginBottom: "30px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "15px 25px",
            borderRadius: "15px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={timerStyle}>⏰ זמן: {timeLeft}s</div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}
          >
            🎯 ניקוד: {score}
          </div>
        </div>
        <div style={questionBoxStyle}>
          <h2
            style={{
              fontSize: "4em",
              margin: "0 0 25px 0",
              color: "#333",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            {currentQuestion.num1} {currentQuestion.operator}{" "}
            {currentQuestion.num2} = ?
          </h2>

          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            style={textInputStyle}
            placeholder="הכנס תשובה"
            autoFocus
          />

          <br />

          <button
            onClick={submitAnswer}
            disabled={!userAnswer}
            style={{
              ...primaryButtonStyle,
              backgroundColor: userAnswer ? "#4CAF50" : "#A5D6A7", // Lighter green when disabled
              cursor: userAnswer ? "pointer" : "not-allowed",
            }}
          >
            ✓ שלח תשובה
          </button>

          {feedback && (
            <div className={`question-feedback ${feedback}`}>
              {feedback === "correct" ? "🎉" : "❌"}
            </div>
          )}
        </div>
        <button
          onClick={endGame}
          style={{
            ...dangerButtonStyle,
            padding: "12px 25px",
            fontSize: "16px",
          }}
        >
          סיים משחק
        </button>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="math-game" style={gameContainerStyle}>
        <style>{globalStyles}</style> {/* Apply global styles */}
        {showConfetti && <div className="confetti-overlay"></div>}{" "}
        {/* Confetti overlay */}
        <h2
          style={{
            color: "#4A90E2",
            marginBottom: "25px",
            fontSize: "3em",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          🎉 כל הכבוד! 🎉
        </h2>
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "35px",
            borderRadius: "20px",
            marginBottom: "30px",
            border: "3px solid #4A90E2",
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
          }}
        >
          <h3
            style={{ fontSize: "2.2em", margin: "0 0 15px 0", color: "#333" }}
          >
            הניקוד הסופי שלך: <span style={{ color: "#4CAF50" }}>{score}</span>{" "}
            נקודות!
          </h3>
          <p style={{ fontSize: "1.2em", color: "#666", margin: "0" }}>
            שחקן: <span style={{ fontWeight: "bold" }}>{playerName}</span> |
            רמה:{" "}
            <span style={{ fontWeight: "bold" }}>
              {difficulty === "easy"
                ? "קל"
                : difficulty === "medium"
                ? "בינוני"
                : "קשה"}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <button onClick={resetGame} style={primaryButtonStyle}>
            🔄 משחק חדש
          </button>

          <button onClick={startGame} style={secondaryButtonStyle}>
            🚀 שחק שוב
          </button>
        </div>
        {/* Updated Leaderboard */}
        <div
          style={{ maxWidth: "450px", margin: "40px auto 0", width: "100%" }}
        >
          <h3
            style={{
              color: "#4A90E2",
              marginBottom: "20px",
              fontSize: "1.8em",
              textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            🏆 לוח התוצאות המעודכן 📊
          </h3>
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "15px",
              padding: "20px",
              border: "1px solid #e9ecef",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          >
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: index < 4 ? "1px dashed #e9ecef" : "none",
                  backgroundColor:
                    entry.name === playerName && entry.score === score
                      ? "#e3f2fd"
                      : "transparent",
                  borderRadius: "8px",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                  fontWeight:
                    entry.name === playerName && entry.score === score
                      ? "bold"
                      : "normal",
                  boxShadow:
                    entry.name === playerName && entry.score === score
                      ? "0 0 5px rgba(123, 104, 238, 0.3)"
                      : "none",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`}{" "}
                  {entry.name}
                </span>
                <span style={{ fontSize: "0.9em", color: "#666" }}>
                  {entry.score} נקודות (
                  {entry.difficulty === "easy"
                    ? "קל"
                    : entry.difficulty === "medium"
                    ? "בינוני"
                    : "קשה"}
                  )
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default MathMiniGame;
