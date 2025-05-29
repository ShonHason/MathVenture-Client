"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { ArrowLeft, Trophy, Volume2, VolumeX, Star, Zap, Target, Clock } from 'lucide-react'
import { useUser } from "../context/UserContext"
import axios from "axios"
import { toast } from "react-toastify"
const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";

export default function MathMiniGame() {
  const navigate = useNavigate()
  const { user } = useUser()
  const accessToken = localStorage.getItem("accessToken")
  // Game states
  const [gameState, setGameState] = useState("menu")
  const [currentQuestion, setCurrentQuestion] = useState({
    num1: 0,
    num2: 0,
    operator: "+",
  })
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playerName, setPlayerName] = useState("")
  const [difficulty, setDifficulty] = useState("easy")
  const [leaderboard, setLeaderboard] = useState([
    { username: "דן", score: 150, gameDifficulty: "easy" },
    { username: "שון", score: 120, gameDifficulty: "medium" },
    { username: "רועי", score: 200, gameDifficulty: "hard" },
    { username: "רותם", score: 90, gameDifficulty: "easy" },
  ])
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  // Get the effective player name (from context or local state)
  const effectivePlayerName = user?.username || playerName
  const gameType = "math-challenge"; 

  const handleBackToSelection = () => {
    navigate("/home/gameSelection")
  }

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameState === "playing") {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1)
        }, 1000)
      } else {
        endGame()
      }
    }
    return () => clearTimeout(timer)
  }, [timeLeft, gameState])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${baseUrl}/leaderboard`, {
          params: { gameType, gameDifficulty: difficulty }, 
          headers: {
            Authorization: "jwt " + accessToken,  
          },
        });
       if (response.data.length === 0) {
          console.log("No leaderboard data found for this difficulty level.");
          setLeaderboard([]);
          return;
        }
        console.log("Fetched leaderboard:", response.data);
        setLeaderboard(response.data); 
      } catch (error) {
        console.error("Error fetching leaderboard:", error); 
      }
    };
  
    fetchLeaderboard();
  }, [difficulty]);



  // Feedback animation cleanup
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [feedback])

  // Confetti cleanup
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])
 

  const generateQuestion = (difficulty: string) => {
    const operators = ["+", "-", "×"]
    const operator = operators[Math.floor(Math.random() * operators.length)]

    let num1, num2
    if (difficulty === "easy") {
      num1 = Math.floor(Math.random() * 10) + 1
      num2 = Math.floor(Math.random() * 10) + 1
    } else if (difficulty === "medium") {
      num1 = Math.floor(Math.random() * 50) + 1
      num2 = Math.floor(Math.random() * 20) + 1
    } else {
      num1 = Math.floor(Math.random() * 100) + 1
      num2 = Math.floor(Math.random() * 50) + 1
    }

    if (operator === "-" && num2 > num1) {
      ;[num1, num2] = [num2, num1]
    }
    return { num1, num2, operator }
  }

  const calculateAnswer = (question: { num1: number; num2: number; operator: string }) => {
    const { num1, num2, operator } = question
    switch (operator) {
      case "+":
        return num1 + num2
      case "-":
        return num1 - num2
      case "×":
        return num1 * num2
      default:
        return 0
    }
  }

  const startGame = () => {
    console.log("Starting game with:", { effectivePlayerName, difficulty })

    if (!effectivePlayerName.trim()) {
      alert("אנא הכנס שם לפני תחילת המשחק")
      return
    }

    setGameState("playing")
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    setUserAnswer("")
    setCurrentQuestion(generateQuestion(difficulty))
  }

  const submitAnswer = () => {
    if (!userAnswer) return
    const correctAnswer = calculateAnswer(currentQuestion)
    const userNum = Number.parseInt(userAnswer)

    if (userNum === correctAnswer) {
      const basePoints = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20
      const streakBonus = Math.floor(streak / 3) * 5
      const points = basePoints + streakBonus

      setScore((prevScore) => prevScore + points)
      setStreak((prevStreak) => {
        const newStreak = prevStreak + 1
        if (newStreak > bestStreak) {
          setBestStreak(newStreak)
        }
        return newStreak
      })
      setFeedback("correct")
    } else {
      setStreak(0)
      setFeedback("incorrect")
    }

    setUserAnswer("")
    setCurrentQuestion(generateQuestion(difficulty))
  }

  const endGame = async () => {
    setGameState("gameOver");
  
    try {
      // שליחת הבקשה לשמור את התוצאה בלידרבורד
      await axios.post(
        `${baseUrl}/leaderboard/addScore`,
        {
          userId: user?._id,
          username: user?.username,
          score: score,
          email: user?.email,
          gameType: gameType,
          gameDifficulty: difficulty,
        },
        {
          headers: {
            Authorization: "jwt " + accessToken,
          },
        }
      );
  
      const newEntry = {
        username: effectivePlayerName,
        score: score,
        gameDifficulty: difficulty,
      };
  
      const updatedLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
  
      console.log("Updated leaderboard:", updatedLeaderboard);
  
      toast.success("הניקוד נשמר בהצלחה!");
  
      setLeaderboard(updatedLeaderboard);
  
      if (score > 100 || updatedLeaderboard[0]?.username === effectivePlayerName) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Error saving score:", error);
      toast.error("שגיאה בשמירת הניקוד");
    }
  };
  

  const resetGame = () => {
    setGameState("menu")
    setScore(0)
    setStreak(0)
    setTimeLeft(60)
    setUserAnswer("")
    setShowConfetti(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer()
    }
  }

  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty)
  }

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value)
  }

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Back button */}
        <Button
          onClick={handleBackToSelection}
          variant="outline"
          className="absolute top-6 left-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          חזור לבחירת משחקים
        </Button>

        {/* Sound toggle */}
        <Button
          onClick={() => setSoundEnabled(!soundEnabled)}
          variant="outline"
          className="absolute top-6 right-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>

        {/* Title */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl animate-bounce">
            🧮 MathVanture Challenge 🧮
          </h1>
          <p className="text-2xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
            התכוננו לאתגר מתמטי מרגש! פתרו בעיות במהירות וצברו נקודות
          </p>
        </div>

        {/* Game setup and leaderboard - Same height containers */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full relative z-10">
          {/* Game setup form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl h-full">
            <CardContent className="p-8 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
                🎮 הגדרות משחק
              </h2>
              
              <div className="space-y-6 flex-1">
                {/* Player name input */}
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">👤 שם השחקן:</label>
                  <Input
                    type="text"
                    value={effectivePlayerName}
                    onChange={user?.username ? undefined : handlePlayerNameChange}
                    readOnly={!!user?.username}
                    className={`text-xl p-4 text-center border-2 
                      ${user?.username ? "border-gray-300 bg-gray-100 cursor-not-allowed" : "border-purple-300 focus:border-purple-500"}`}
                    placeholder={user?.username ? "" : "הכנס את שמך"}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    שם נוכחי: {effectivePlayerName || "לא הוכנס"}
                    {user?.username && <span className="text-blue-600"> (מחובר)</span>}
                  </p>
                </div>

                {/* Difficulty selection */}
                <div className="flex-1">
                  <label className="block text-lg font-bold text-gray-800 mb-4 text-right">🎯 רמת קושי:</label>
                  <div className="flex flex-col gap-3 w-full" dir="rtl">
                    {[
                      { level: "easy", text: "קל", icon: "⭐", color: "from-green-400 to-green-600" },
                      { level: "medium", text: "בינוני", icon: "🚀", color: "from-yellow-400 to-orange-500" },
                      { level: "hard", text: "קשה", icon: "💀", color: "from-red-400 to-red-600" },
                    ].map(({ level, text, icon, color }) => (
                      <Button
                        key={level}
                        onClick={() => handleDifficultyChange(level)}
                        variant={difficulty === level ? "default" : "outline"}
                        className={`w-full h-16 text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                          difficulty === level
                            ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105 border-2 border-white`
                            : "hover:scale-105 bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-400"
                        }`}
                        dir="rtl"
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-xl font-bold">{text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start game button - Always at bottom */}
              <div className="mt-6">
                <Button
                  onClick={startGame}
                  disabled={!effectivePlayerName.trim()}
                  className="w-full py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 התחל משחק!
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl h-full">
            <CardContent className="p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />🏆 לוח תוצאות 🏆
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400"
                        : index === 1
                          ? "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400"
                          : index === 2
                            ? "bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400"
                            : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600 flex items-center gap-2">
                        <span>{entry.score} נקודות</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.gameDifficulty === "easy" ? "קל" : entry.gameDifficulty === "medium" ? "בינוני" : "קשה"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                      </span>
                      <span className="font-bold text-lg">{entry?.username || "shon"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips section at bottom */}
              <div className="mt-6 text-center">
                <p className="text-purple-600 text-sm font-medium">💡 עצה: התחילו ממשחק קל והתקדמו לרמות קשות יותר!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState === "playing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-20 animate-pulse"></div>
          </div>
        )}

        {/* Header stats */}
        <div className="w-full max-w-4xl mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div
                  className={`text-2xl font-bold ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-blue-600"}`}
                >
                  {timeLeft}s
                </div>
                <div className="text-sm text-gray-600">זמן נותר</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">{score}</div>
                <div className="text-sm text-gray-600">ניקוד</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-gray-600">רצף נכון</div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-purple-600">{bestStreak}</div>
                <div className="text-sm text-gray-600">שיא רצף</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Question card */}
        <Card
          className={`w-full max-w-2xl mb-8 bg-white/95 backdrop-blur-sm shadow-2xl transition-all duration-500 ${
            feedback === "correct"
              ? "ring-4 ring-green-400 bg-green-50"
              : feedback === "incorrect"
                ? "ring-4 ring-red-400 bg-red-50"
                : ""
          }`}
        >
          <CardContent className="p-12 text-center relative">
            <div className="text-8xl font-bold text-gray-800 mb-8 animate-pulse">
              {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
            </div>

            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-4xl p-6 text-center border-4 border-purple-300 focus:border-purple-500 mb-8"
              placeholder="הכנס תשובה"
              autoFocus
            />

            <Button
              onClick={submitAnswer}
              disabled={!userAnswer}
              className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ שלח תשובה
            </Button>

            {feedback && (
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <div
                  className={`text-9xl font-bold animate-bounce ${
                    feedback === "correct" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {feedback === "correct" ? "🎉" : "❌"}
                </div>
              </div>
            )}

            {streak >= 3 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-4 py-2 animate-pulse">
                  🔥 רצף חם! +{Math.floor(streak / 3) * 5} נקודות בונוס
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={endGame}
          variant="outline"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          סיים משחק
        </Button>
      </div>
    )
  }

  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-30 animate-pulse"></div>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-6 drop-shadow-2xl animate-bounce">🎉 כל הכבוד! 🎉</h1>
        </div>

        <Card className="w-full max-w-lg mb-8 bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">הניקוד הסופי שלך:</h2>
            <div className="text-6xl font-bold text-green-600 mb-6">{score}</div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{bestStreak}</div>
                <div className="text-sm text-gray-600">שיא רצף</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {difficulty === "easy" ? "קל" : difficulty === "medium" ? "בינוני" : "קשה"}
                </div>
                <div className="text-sm text-gray-600">רמת קושי</div>
              </div>
            </div>
            <p className="text-lg text-gray-600">
              שחקן: <span className="font-bold">{effectivePlayerName}</span>
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-8">
          <Button
            onClick={resetGame}
            className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🔄 משחק חדש
          </Button>
          <Button
            onClick={startGame}
            className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🚀 שחק שוב
          </Button>
        </div>

        {/* Updated Leaderboard */}
        <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              לוח התוצאות המעודכן
            </h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-4 rounded-lg transition-all duration-300 ${
                    entry.username === effectivePlayerName && entry.score === score
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-purple-400 shadow-lg"
                      : index === 0
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400"
                        : index === 1
                          ? "bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-400"
                          : index === 2
                            ? "bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-400"
                            : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600 flex items-center gap-2">
                      <span>{entry.score} נקודות</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.gameDifficulty === "easy" ? "קל" : entry.gameDifficulty === "medium" ? "בינוני" : "קשה"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                    </span>
                    <span className="font-bold text-lg">{entry.username}</span>
                    {entry.username === effectivePlayerName && entry.score === score && (
                      <Badge className="bg-purple-500 text-white">חדש!</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
