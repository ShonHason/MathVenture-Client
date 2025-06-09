"use client";

import {
  Play,
  Pause,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  X,
  Repeat,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";

interface ControlPanelProps {
  progress: number;
  currentQuestion: number;
  correctAnswers: number;
  isLessonComplete: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  botVolume: number;
  speechSpeed: number;
  isVisible: boolean;
  onTogglePlayPause: () => void;
  onAdjustVolume: () => void;
  onAdjustSpeed: () => void;
  onToggleMute: () => void;
  onReturnToMain: () => void;
  onRepeatMessage: () => void;
  isPushToTalkMode: boolean;
  onTogglePushToTalk: (mode: boolean) => void;
}

export default function ControlPanel({
  progress,
  currentQuestion,
  correctAnswers,
  isLessonComplete,
  isPlaying,
  isMuted,
  botVolume,
  speechSpeed,
  isVisible,
  onTogglePlayPause,
  onAdjustVolume,
  onAdjustSpeed,
  onToggleMute,
  onReturnToMain,
  onRepeatMessage,
  isPushToTalkMode,
  onTogglePushToTalk,
}: ControlPanelProps) {
  const { user } = useUser();

  const renderVolumeIcon = () => {
    if (botVolume === 0) return <VolumeX className="text-blue-600 h-5 w-5" />;
    if (botVolume <= 30) return <Volume className="text-blue-600 h-5 w-5" />;
    if (botVolume <= 60) return <Volume1 className="text-blue-600 h-5 w-5" />;
    return <Volume2 className="text-blue-600 h-5 w-5" />;
  };

  const getSpeedDisplay = () => {
    return `${speechSpeed}x`;
  };

  const getSpeedColor = () => {
    if (speechSpeed <= 0.5) return "text-blue-600";
    if (speechSpeed === 1) return "text-green-600";
    if (speechSpeed <= 1.5) return "text-orange-600";
    return "text-red-600";
  };

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
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
              <img
                src={user?.imageUrl || "/default-avatar.png"}
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div
                className={`w-64 h-6 rounded-full overflow-hidden relative ${
                  isLessonComplete ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLessonComplete
                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                      : "bg-gradient-to-r from-green-400 to-blue-500"
                  }`}
                  style={{
                    width: `${((currentQuestion || 0) / 15) * 100}%`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-xs font-bold ${
                      isLessonComplete ? "text-green-800" : "text-gray-700"
                    }`}
                  >
                    {isLessonComplete
                      ? "🎉 השיעור הושלם!"
                      : currentQuestion === 0 || currentQuestion === undefined
                      ? "החלק הראשון"
                      : `${currentQuestion}/15`}
                  </span>
                </div>
              </div>
              <div
                className={`text-xs text-center ${
                  isLessonComplete
                    ? "text-green-600 font-bold"
                    : "text-gray-500"
                }`}
              >
                {isLessonComplete
                  ? "כל הכבוד! סיימת את השיעור"
                  : currentQuestion === 0 || currentQuestion === undefined
                  ? "השאלה הבאה: 1"
                  : `השאלה הבאה: ${currentQuestion + 1}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlayPause}
              title={isPlaying ? "עצור" : "המשך"}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-green-100 shadow-md hover:bg-green-50 transition-colors"
            >
              {isPlaying ? (
                <Pause className="text-green-600 h-5 w-5" />
              ) : (
                <Play className="text-green-600 h-5 w-5" />
              )}
            </button>

            <button
              onClick={onAdjustVolume}
              title="עוצמת קול"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md hover:bg-blue-50 transition-colors"
            >
              {renderVolumeIcon()}
            </button>

            <button
              onClick={onAdjustSpeed}
              title="מהירות דיבור"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-orange-100 shadow-md hover:bg-orange-50 transition-colors relative"
            >
              <div className="flex flex-col items-center">
                <Gauge className="text-orange-600 h-4 w-4" />
                <span className={`text-xs font-bold ${getSpeedColor()}`}>
                  {getSpeedDisplay()}
                </span>
              </div>
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? "בטל השתקה" : "השתק"}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-purple-100 shadow-md hover:bg-purple-50 transition-colors"
            >
              {isMuted ? (
                <MicOff className="text-purple-600 h-5 w-5" />
              ) : (
                <Mic className="text-purple-600 h-5 w-5" />
              )}
            </button>

            <button
              onClick={onRepeatMessage}
              title="חזור על ההודעה האחרונה"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-yellow-100 shadow-md hover:bg-yellow-50 transition-colors"
            >
              <Repeat className="text-yellow-600 h-5 w-5" />
            </button>

            <button
              onClick={onReturnToMain}
              title="חזור לתפריט הראשי"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-red-100 shadow-md hover:bg-red-50 transition-colors"
            >
              <X className="text-red-600 h-5 w-5" />
            </button>
          </div>
          <button title="מצב לחיצה לדיבור מופעל"></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
