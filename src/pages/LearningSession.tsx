// src/pages/LearningSession.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import DrawingPanel from "../components/drawing-panel"
import KeyboardPanel from "../components/keyboard-panel"
import Avatar from "../components/Avatar"
import TranscriptModel from "../components/transcript-model"
import ControlPanel from "../components/control-panel"
import ToggleControlButton from "../components/ ToggleControlButton"
import RealTimeRecorder from "../components/RealTimeRecorder"
import { useUser } from "../context/UserContext"

// כאן הייבוא של שירות ה-OCR של Paddle
import { scanMathFromCanvas } from "../services/tesseractOcrService"

const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000"

type LocationState = {
  state: {
    topic: { subject: string; question: string }
    lessonId?: string
  }
}

export default function LearningSession() {
  const { user } = useUser()
  const {
    state: { topic, lessonId: initialLessonId },
  } = useLocation() as LocationState

  const [lessonId, setLessonId] = useState<string | null>(initialLessonId ?? null)
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([])
  const [messagesLoaded, setMessagesLoaded] = useState(false)
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false)
  const [botSpeech, setBotSpeech] = useState("")
  const [botStatus, setBotStatus] = useState("עצור")
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw")
  const [botVolume, setBotVolume] = useState(100)

  // state להנפקת key חדש לאיפוס פאנלים
  const [resetKey, setResetKey] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const lastTranscriptRef = useRef("")
  const lastSentRef = useRef("")

  const currentQuestion = topic.question || ""

  // Fetch history once
  useEffect(() => {
    async function fetchMessages() {
      if (!lessonId) return
      try {
        const { data } = await axios.get(
          `${socketServerUrl}/lessons/${lessonId}/messages`,
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
        )
        const raw = data.messages as Array<{ role: string; content: string }>
        const formatted = raw
          .slice(1)
          .map(m => ({
            sender: m.role === "user" ? "user" as "user" : "bot" as "bot",
            text: m.content
          }))
        setMessages(formatted)
      } catch (err) {
        console.error(err)
      } finally {
        setMessagesLoaded(true)
      }
    }
    fetchMessages()
  }, [lessonId, user?.accessToken])

  // Intro once loaded
  useEffect(() => {
    if (messagesLoaded && user?.username && topic.subject && !hasSpokenIntro) {
      const opening =
        messages.length > 0
          ? `שלום ${user.username}, שמח לראות שחזרת אליי! השיעור על ${topic.subject} ממשיך.`
          : `שלום ${user.username}, שמח לראות אותך! היום נלמד על ${topic.subject}.`
      setMessages([{ sender: "bot", text: opening }])
      setBotSpeech(opening)
      setHasSpokenIntro(true)
      speak(opening)
    }
  }, [messagesLoaded, user, topic, hasSpokenIntro, messages.length])

  // Start new lesson
  useEffect(() => {
    if (hasSpokenIntro && !lessonId && user?._id) {
      axios
        .post(
          `${socketServerUrl}/lessons/start`,
          { userId: user._id, subject: topic.subject },
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
        )
        .then(r => setLessonId(r.data.lessonId))
        .catch(console.error)
    }
  }, [hasSpokenIntro, lessonId, user, topic])

  // TTS
  const speak = async (text: string) => {
    try {
      setIsSpeaking(true)
      setListening(false)
      setBotStatus("...מדבר")
      const res = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text, lang: "he-IL" },
        { responseType: "arraybuffer" }
      )
      const blob = new Blob([res.data], { type: "audio/mp3" })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.volume = botVolume / 100
      audioRef.current = audio
      await audio.play()
      audio.onended = () => {
        setIsSpeaking(false)
        setListening(true)
        setBotStatus("..מקשיב")
      }
    } catch {
      setIsSpeaking(false)
      setListening(false)
      setBotStatus("עצור")
    }
  }

  // Debounce transcript
  const handleTranscript = (t: string) => {
    if (!listening) return
    lastTranscriptRef.current = t
    clearTimeout(silenceTimerRef.current!)
    silenceTimerRef.current = window.setTimeout(() => {
      const final = lastTranscriptRef.current.trim()
      if (final) sendTranscript(final)
      lastTranscriptRef.current = ""
    }, 2000)
  }

  // Send to chat
  const sendTranscript = async (input: string) => {
    if (input === lastSentRef.current) return
    lastSentRef.current = input
    setMessages(m => [...m, { sender: "user", text: input }])
    try {
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      )
      const ai = resp.data.answer
      setMessages(m => [...m, { sender: "bot", text: ai }])
      setBotSpeech(ai)
      speak(ai)
    } catch (err) {
      console.error(err)
    }
  }

  // Cleanup
  useEffect(() => () => clearTimeout(silenceTimerRef.current!), [])

  // Scan callbacks
  const handleDrawingScan = async (canvas: HTMLCanvasElement) => {
    try {
      // scanMathFromCanvas now returns a single string, not string[]
      const mathText = await scanMathFromCanvas(canvas)
      if (mathText) {
        sendTranscript(mathText)    // send the string directly
      } else {
        console.warn("Tesseract: לא זוהה טקסט מתמטי")
      }
    } catch (err) {
      console.error("Math OCR failed:", err)
    } finally {
      setResetKey(k => k + 1)
    }
  }
  const handleKeyboardScan = (displayedText: string) => {
    if (!displayedText) return
    sendTranscript(displayedText)
    setResetKey(k => k + 1)
  }

  // Control panel actions...
  const handlePlayPause = () => {
    const audio = audioRef.current
    if (isSpeaking && audio) {
      audio.pause()
      setIsSpeaking(false)
      setBotStatus("עצור")
      return
    }
    if (!isSpeaking && audio && audio.currentTime > 0 && audio.currentTime < audio.duration) {
      audio.play()
      setIsSpeaking(true)
      setBotStatus("...מדבר")
      setListening(false)
      return
    }
    setListening(l => {
      const next = !l
      setBotStatus(next ? "..מקשיב" : "עצור")
      return next
    })
  }
  const handleMute = () => {
    setListening(l => !l)
    setBotStatus(listening ? "עצור" : "..מקשיב")
  }
  const handleAdjustVolume = () => {
    const next = botVolume === 100 ? 60 : botVolume === 60 ? 30 : botVolume === 30 ? 0 : 100
    setBotVolume(next)
    if (audioRef.current) audioRef.current.volume = next / 100
  }
  const handleRepeat = () => {
    if (isSpeaking) return
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setIsSpeaking(true)
      setListening(false)
      setBotStatus("...מדבר")
    } else {
      speak(botSpeech)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-purple-100 p-4 flex flex-col items-center justify-center">
      <div className="fixed top-4 right-4 z-50">
        <ToggleControlButton isOpen={controlsOpen} onClick={() => setControlsOpen(o => !o)} />
      </div>

      {controlsOpen && (
        <div className="w-full max-w-3xl mb-4">
          <ControlPanel
            progress={0}
            isVisible
            isPlaying={isSpeaking}
            isMuted={!listening}
            botVolume={botVolume}
            onTogglePlayPause={handlePlayPause}
            onToggleMute={handleMute}
            onAdjustVolume={handleAdjustVolume}
            onReturnToMain={() => {}}
            onRepeatMessage={handleRepeat}
          />
        </div>
      )}

      <div className="w-full max-w-3xl flex gap-6 flex-col md:flex-row mb-4">
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center">
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full px-8 py-3 mb-6 font-bold text-xl text-right w-full text-white">
            {botStatus}
          </div>
          <Avatar />
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-blue-100">
            {botSpeech}
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6 text-right w-full border-2 border-yellow-200">
            {currentQuestion}
          </div>
          <button
            onClick={() => setIsTranscriptOpen(true)}
            className="w-full bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-md"
          >
            הצג תמלול שיחה
          </button>
        </div>
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg flex flex-col">
          <div className="flex mb-4">
            <button
              className={`flex-1 py-3 px-6 rounded-l-full font-bold ${activeTab === "draw" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
              onClick={() => setActiveTab("draw")}
            >
              ציור
            </button>
            <button
              className={`flex-1 py-3 px-6 rounded-r-full font-bold ${activeTab === "keyboard" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}
              onClick={() => setActiveTab("keyboard")}
            >
              מחשבון
            </button>
          </div>
          {activeTab === "draw" ? (
            <DrawingPanel key={resetKey} onScan={handleDrawingScan} />
          ) : (
            <KeyboardPanel key={resetKey} onScan={handleKeyboardScan} />
          )}
        </div>
      </div>

      <RealTimeRecorder micMuted={!listening} onTranscript={handleTranscript} />
      {isTranscriptOpen && <TranscriptModel messages={messages} onClose={() => setIsTranscriptOpen(false)} />}
    </div>
  )
}
