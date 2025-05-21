"use client"

import { useState } from "react"
import DrawingPanel from "../components/drawing-panel"
import KeyboardPanel from "../components/keyboard-panel"
import Avatar from "../components/Avatar"
import TranscriptModel from "../components/transcript-model"
import ControlPanel from "../components/control-panel"
import ToggleControlButton from "../components/ ToggleControlButton"

export default function LearningSession() {
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw")
  const [progress, setProgress] = useState(65)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [botVolume, setBotVolume] = useState(80)
  const [currentQuestion, setCurrentQuestion] = useState("איך חכמי לציר אה בדרך אח תביר לפצר יותר?")
  const [botStatus, setBotStatus] = useState("מצב : חדבר")
  const [botSpeech, setBotSpeech] = useState("מטעטנר, עדין אתה לפפור איך חכמי לציר אה בדרך אח תביר לפצר יותר?")
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true)

  // Sample transcript messages
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    { sender: "bot", text: "שלום! בוא נלמד איך לפתור בעיות מתמטיות." },
    { sender: "user", text: "אני מוכן ללמוד." },
    { sender: "bot", text: "מצוין! בוא נתחיל עם תרגיל פשוט." },
    { sender: "bot", text: "מטעטנר, עדין אתה לפפור איך חכמי לציר אה בדרך אח תביר לפצר יותר?" },
  ])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    console.log(`Bot ${isPlaying ? "stopped" : "resumed"}`)
  }

  const adjustVolume = () => {
    // Cycle through volume levels
    setBotVolume((prev) => {
      const newVolume = prev === 100 ? 60 : prev === 60 ? 30 : prev === 30 ? 0 : 100
      console.log(`Avatar volume set to ${newVolume}%`)
      return newVolume
    })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    console.log(`Microphone ${isMuted ? "unmuted" : "muted"}`)
  }

  const returnToMain = () => {
    // Return to main menu logic
    console.log("Returning to main menu")
  }

  const repeatLastMessage = () => {
    console.log("Repeating last message")
    // Logic to repeat the last message would go here
  }

  const toggleTranscript = () => {
    setIsTranscriptOpen(!isTranscriptOpen)
  }

  const toggleControlPanel = () => {
    setIsControlPanelVisible(!isControlPanelVisible)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-purple-100 p-4 flex flex-col items-center justify-center">
      {/* Toggle Control Panel Button */}
      <ToggleControlButton isOpen={isControlPanelVisible} onClick={toggleControlPanel} />

      {/* Top control bar */}
      <ControlPanel
        progress={progress}
        isPlaying={isPlaying}
        isMuted={isMuted}
        botVolume={botVolume}
        isVisible={isControlPanelVisible}
        onTogglePlayPause={togglePlayPause}
        onAdjustVolume={adjustVolume}
        onToggleMute={toggleMute}
        onReturnToMain={returnToMain}
        onRepeatMessage={repeatLastMessage}
      />

      {/* Main content */}
      <div className="w-full max-w-3xl flex gap-6 flex-col md:flex-row">
        {/* Left panel - Robot and instructions */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full px-8 py-3 mb-6 font-bold text-xl text-right w-full text-white">
            {botStatus}
          </div>

          {/* Avatar component */}
          <Avatar />

          {/* Bot speech */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-blue-100">
            <p className="text-gray-800 font-medium">{botSpeech}</p>
          </div>

          {/* Question area */}
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-yellow-200">
            <p className="text-gray-700 font-medium">{currentQuestion}</p>
          </div>

          {/* Transcript button */}
          <button
            onClick={toggleTranscript}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
          >
            <span>הצג תמלול שיחה</span>
          </button>
        </div>



        {/* Right panel - Drawing/Keyboard area */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-3 px-6 rounded-l-full font-bold ${
                activeTab === "draw"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setActiveTab("draw")}
            >
              DRAW
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-r-full font-bold ${
                activeTab === "keyboard"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
              onClick={() => setActiveTab("keyboard")}
            >
              KEYBOARD
            </button>
          </div>

          {activeTab === "draw" ? <DrawingPanel /> : <KeyboardPanel />}
        </div>
      </div>

      {/* Transcript Modal */}
      {isTranscriptOpen && <TranscriptModel messages={messages} onClose={toggleTranscript} />}
    </div>
  )
}