"use client"

import { Play, Pause, Volume, Volume1, Volume2, VolumeX, Mic, MicOff, X, Repeat } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ControlPanelProps {
  progress: number
  isPlaying: boolean
  isMuted: boolean
  botVolume: number
  isVisible: boolean
  onTogglePlayPause: () => void
  onAdjustVolume: () => void
  onToggleMute: () => void
  onReturnToMain: () => void
  onRepeatMessage: () => void
}

export default function ControlPanel({
  progress,
  isPlaying,
  isMuted,
  botVolume,
  isVisible,
  onTogglePlayPause,
  onAdjustVolume,
  onToggleMute,
  onReturnToMain,
  onRepeatMessage,
}: ControlPanelProps) {
  // Function to render the appropriate volume icon based on volume level
  const renderVolumeIcon = () => {
    if (botVolume === 0) return <VolumeX className="text-blue-600 h-5 w-5" />
    if (botVolume <= 30) return <Volume className="text-blue-600 h-5 w-5" />
    if (botVolume <= 60) return <Volume1 className="text-blue-600 h-5 w-5" />
    return <Volume2 className="text-blue-600 h-5 w-5" />
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl bg-white rounded-full p-4 mb-6 shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="text-gray-700 text-xl">😊</div>
                </div>
              </div>
            </div>

            <div className="w-64 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-green-100 shadow-md hover:bg-green-50 transition-colors"
              onClick={onTogglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              title={isPlaying ? "עצור" : "המשך"}
            >
              {isPlaying ? <Pause className="text-green-600 h-5 w-5" /> : <Play className="text-green-600 h-5 w-5" />}
            </button>

            {/* Volume Button */}
            <button
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md hover:bg-blue-50 transition-colors"
              onClick={onAdjustVolume}
              aria-label="Adjust volume"
              title="עוצמת קול"
            >
              {renderVolumeIcon()}
            </button>

            {/* Mute/Unmute Button */}
            <button
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-purple-100 shadow-md hover:bg-purple-50 transition-colors"
              onClick={onToggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "בטל השתקה" : "השתק"}
            >
              {isMuted ? <MicOff className="text-purple-600 h-5 w-5" /> : <Mic className="text-purple-600 h-5 w-5" />}
            </button>

            {/* Repeat Button */}
            <button
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-yellow-100 shadow-md hover:bg-yellow-50 transition-colors"
              onClick={onRepeatMessage}
              aria-label="Repeat message"
              title="חזור על ההודעה האחרונה"
            >
              <Repeat className="text-yellow-600 h-5 w-5" />
            </button>

            {/* Return to Main Button */}
            <button
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-red-100 shadow-md hover:bg-red-50 transition-colors"
              onClick={onReturnToMain}
              aria-label="Return to main menu"
              title="חזור לתפריט הראשי"
            >
              <X className="text-red-600 h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
