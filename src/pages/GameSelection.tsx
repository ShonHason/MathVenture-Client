"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Play, Lock, Star, Zap, Trophy, Clock } from "lucide-react"

export default function GameSelection() {
  const navigate = useNavigate()
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  const handleGameSelect = (gameId: string) => {
    if (gameId === "math-challenge") {
      navigate("/home/math-minigame")
    } else if (gameId === "geometry-quest") {
      navigate("/geometry-quest")
    }
  }

  const games = [
    {
      id: "math-challenge",
      title: "MathVenture Challenge",
      description: "פתור בעיות מתמטיות במהירות וצבור נקודות!",
      icon: "🧮",
      difficulty: "קל-בינוני",
      timeLimit: "60 שניות",
      available: true,
      features: ["חיבור, חיסור, כפל", "3 רמות קושי", "לוח תוצאות", "אפקטי קול"],
      color: "from-green-300 to-yellow-300",
    },
    {
      id: "geometry-quest",
      title: "Geometry Quest",
      description: "חקור צורות גיאומטריות ופתור חידות מרחביות!",
      icon: "📐",
      difficulty: "בינוני-קשה",
      timeLimit: "90 שניות",
      available: false,
      features: ["זיהוי צורות", "חישוב שטחים", "זוויות ומשולשים", "תלת מימד"],
      color: "from-blue-300 to-indigo-300",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-300 to-purple-400 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
      </div>

      {/* Floating math symbols */}
      <div className="absolute inset-0 pointer-events-none">
        {/*<div className="absolute top-20 left-20 text-3xl text-white/30 animate-bounce">+</div>
        <div className="absolute top-40 right-32 text-2xl text-white/30 animate-bounce delay-300">×</div>
        <div className="absolute bottom-32 left-40 text-4xl text-white/30 animate-bounce delay-700">=</div>
        <div className="absolute bottom-20 right-20 text-3xl text-white/30 animate-bounce delay-500">÷</div>
        <div className="absolute top-1/3 left-1/4 text-2xl text-white/30 animate-bounce delay-1000">√</div>*/}
      </div>

      <div className="relative z-10 text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-4 drop-shadow-lg" dir="rtl">
          🎮 Math Games Hub 🎮
        </h1>
        <p className="text-lg text-blue-800 max-w-2xl mx-auto leading-relaxed" dir="rtl">
          ברוכים הבאים למרכז המשחקים המתמטיים! בחרו את המשחק שלכם והתחילו להתאמן
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
          <span className="text-blue-800">משחקים חינוכיים ומהנים</span>
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full relative z-10">
        {games.map((game) => (
          <Card
            key={game.id}
            className={`relative overflow-hidden transition-all duration-500 transform hover:scale-105 bg-white/90 border-2 border-transparent hover:border-blue-500 ${
              game.available ? "cursor-pointer" : "opacity-75 cursor-not-allowed"
            }`}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20`}></div>

            {!game.available && (
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  בקרוב...
                </div>
              </div>
            )}

            <CardContent className="p-6 relative z-10">
              <div className="text-center mb-4">
                <div className="text-4xl mb-4 animate-bounce">{game.icon}</div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">{game.title}</h2>
                <p className="text-blue-700 leading-relaxed">{game.description}</p>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between bg-blue-100 rounded-lg p-3" dir="rtl">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-blue-800">רמת קושי:</span>
                  </div>
                  <span className="text-blue-700">{game.difficulty}</span>
                </div>

                <div className="flex items-center justify-between bg-blue-100 rounded-lg p-3" dir="rtl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-blue-800">זמן משחק:</span>
                  </div>
                  <span className="text-blue-700">{game.timeLimit}</span>
                </div>
              </div>

              <div className="mb-6" dir="rtl">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  תכונות המשחק:
                </h3>
                <ul className="space-y-2">
                  {game.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2" dir="rtl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => game.available && handleGameSelect(game.id)}
                disabled={!game.available}
                className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
                  game.available
                    ? `bg-gradient-to-r ${game.color} hover:shadow-lg transform hover:-translate-y-1 text-blue-900`
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {game.available ? (
                  <div className="flex items-center justify-center gap-2">
                    <Play className="w-6 h-6" />
                    התחל לשחק!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    בקרוב...
                  </div>
                )}
              </Button>

              {hoveredGame === game.id && game.available && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-300/30 to-yellow-300/30 rounded-lg pointer-events-none animate-pulse"></div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center relative z-10" dir="rtl">
        <p className="text-blue-800 text-lg">💡 עצה: התחילו ממשחק קל והתקדמו לרמות קשות יותר!</p>
      </div>
    </div>
  )
}