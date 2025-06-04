// src/pages/LearningSession.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DrawingPanel from "../components/drawing-panel";
import KeyboardPanel from "../components/keyboard-panel";
import Avatar from "../components/Avatar";
import SpeakingIndicator from "../components/SpeakingIndicator"; // Import SpeakingIndicator

import TranscriptModel from "../components/transcript-model";
import ControlPanel from "../components/control-panel"; // Keep ControlPanel component
// import ToggleControlButton from "../components/ToggleControlButton";
import RealTimeRecorder from "../components/RealTimeRecorder";
import { useUser } from "../context/UserContext";
import "./LearningSession.css";
import { scanMathFromCanvas } from "../services/tesseractOcrService";
import {
  ControlPanelProvider,
  useControlPanel,
} from "../context/ControlPanelContext"; // Import provider and hook

const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

interface LessonBackendData {
  _id: string;
  mathQuestionsCount: number;
  currentQuestionAttempts: number;
}

type LocationState = {
  state: {
    topic: { subject: string; question: string };
    lessonId?: string;
  };
};

// This component will contain the actual session logic and consume the context
function LearningSessionContent() {
  const recorderRef = useRef<any>(null);
  const { user } = useUser();
  const {
    state: { topic, lessonId: initialLessonId },
  } = useLocation() as LocationState;
  const navigate = useNavigate();

  // Local state for lesson details coming from the backend API
  const [lessonDetails, setLessonDetails] = useState<LessonBackendData | null>(
    null
  );
  const [messages, setMessages] = useState<
    { sender: "bot" | "user"; text: string }[]
  >([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw");
  const [resetKey, setResetKey] = useState(0);
  const [currentAudioElement, setCurrentAudioElement] =
    useState<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef("");
  const lastSentRef = useRef("");

  // *** USE CONTEXT HERE to get all necessary states and functions ***
  const {
    isVisible,
    setIsVisible,
    isLessonComplete,
    setIsLessonComplete,
    progress,
    setProgress,
    currentQuestion,
    setCurrentQuestion,
    correctAnswers,
    setCorrectAnswers,
    isPlaying,
    isMuted,
    botVolume,
    speechSpeed,
    botSpeech,
    setBotSpeech,
    botStatus,
    setBotStatus,
    speak,
    stopTTS,
    onRepeatMessage,
    onTogglePlayPause,
    onToggleMute,
    onAdjustVolume,
    onAdjustSpeed,
  } = useControlPanel();

  // Derived state for easier access from backend data
  const lessonId = lessonDetails?._id;
  const backendCorrectAnswersCount = lessonDetails?.mathQuestionsCount ?? 0;
  const backendCurrentQuestionAttempts =
    lessonDetails?.currentQuestionAttempts ?? 0;

  // Sync backend-derived states with the context's internal states
  useEffect(() => {
    const calculatedProgress = (backendCorrectAnswersCount / 15) * 100;
    setProgress(calculatedProgress);
  }, [backendCorrectAnswersCount, setProgress]);

  useEffect(() => {
    setCurrentQuestion(backendCorrectAnswersCount + 1);
  }, [backendCorrectAnswersCount, setCurrentQuestion]);

  useEffect(() => {
    setCorrectAnswers(backendCorrectAnswersCount);
  }, [backendCorrectAnswersCount, setCorrectAnswers]);

  useEffect(() => {
    setIsLessonComplete(backendCorrectAnswersCount >= 15);
  }, [backendCorrectAnswersCount, setIsLessonComplete]);

  // 1. Initialize Lesson (start new or resume existing)
  useEffect(() => {
    async function initializeLesson() {
      console.log("initializeLesson: START");
      if (!user?._id || !topic.subject) {
        console.error(
          "initializeLesson: User ID or topic subject not available. Redirecting to home."
        );
        navigate("/home");
        return;
      }

      try {
        let lessonResponse;
        if (initialLessonId) {
          console.log(
            `initializeLesson: Attempting to resume lesson with ID: ${initialLessonId}`
          );
          lessonResponse = await axios.post<LessonBackendData>(
            `${socketServerUrl}/lessons/startNew/${initialLessonId}`,
            { userId: user._id, subject: topic.subject },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
          );
        } else {
          console.log("initializeLesson: Attempting to start a new lesson.");
          lessonResponse = await axios.post<LessonBackendData>(
            `${socketServerUrl}/lessons/startNew`,
            {
              userId: user._id,
              subject: topic.subject,
              username: user.username,
              grade: user.grade || "default_grade",
              rank: user.rank || "default_rank",
              sampleQuestions: [],
            },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
          );
        }

        setLessonDetails(lessonResponse.data);

        if (!initialLessonId && lessonResponse.data._id) {
          navigate(`/lessons/${lessonResponse.data._id}`, {
            replace: true,
            state: { topic: topic },
          });
        }

        if (lessonResponse.data._id) {
          const { data: historyData } = await axios.get(
            `${socketServerUrl}/lessons/${lessonResponse.data._id}/messages`,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
          );
          const raw = historyData.messages as Array<{
            role: string;
            content: string;
          }>;
          const formatted = raw
            .filter((m) => m.role !== "system")
            .map((m) => ({
              sender: m.role === "user" ? "user" : "bot",
              text: m.content,
            })) as { sender: "bot" | "user"; text: string }[];
          setMessages(formatted);
        }
      } catch (err) {
        console.error("initializeLesson: Error during API calls.", err);
        if (axios.isAxiosError(err)) {
          console.error("Axios error response:", err.response?.data);
        }
      } finally {
        setMessagesLoaded(true);
      }
    }

    if (user?._id && topic.subject && !lessonDetails) {
      initializeLesson();
    }
  }, [user, topic, initialLessonId, navigate, lessonDetails]);

  // 2. Initial Intro Speech
  useEffect(() => {
    if (
      messagesLoaded &&
      lessonDetails &&
      user?.username &&
      topic.subject &&
      !hasSpokenIntro
    ) {
      let openingMessageText = "";

      if (messages.length > 0 && messages[0].sender === "bot") {
        openingMessageText = messages[0].text;
      } else {
        openingMessageText = `שלום ${user.username}, שמח לראות אותך! היום נלמד על ${topic.subject}. מוכן להתחיל?`;
        setMessages([{ sender: "bot", text: openingMessageText }]);
      }

      setBotSpeech(openingMessageText); // Update bot speech in context
      speak(openingMessageText); // Use speak from context
      setHasSpokenIntro(true);
    }
  }, [
    messagesLoaded,
    lessonDetails,
    user,
    topic,
    hasSpokenIntro,
    messages,
    setBotSpeech,
    speak,
  ]);

  // Debounce transcript
  const handleTranscript = (t: string) => {
    if (isMuted || isPlaying) return; // Use isMuted and isPlaying from context
    lastTranscriptRef.current = t;
    clearTimeout(silenceTimerRef.current!);
    silenceTimerRef.current = window.setTimeout(() => {
      const final = lastTranscriptRef.current.trim();
      if (final) {
        sendTranscript(final);
      }
      lastTranscriptRef.current = "";
    }, 2000);
  };

  // Send to chat
  const sendTranscript = async (input: string) => {
    if (!input.trim() || input === lastSentRef.current || !lessonId) {
      console.warn(
        "Skipping sendTranscript: empty input, duplicate, or no lessonId.",
        { input, lastSentRef: lastSentRef.current, lessonId }
      );
      return;
    }
    lastSentRef.current = input;
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setBotStatus("חושב..."); // Update bot status via context

    try {
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        {
          question: input,
          currentQuestionAttempts: lessonDetails?.currentQuestionAttempts,
        },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );

      const {
        answer,
        mathQuestionsCount,
        currentQuestionAttempts,
        done,
        strengths,
        weaknesses,
        tips,
      } = resp.data;

      setLessonDetails({
        _id: lessonId,
        mathQuestionsCount: mathQuestionsCount,
        currentQuestionAttempts: currentQuestionAttempts,
      });

      if (done) {
        setBotSpeech(answer); // Update bot speech in context
        setMessages((m) => [...m, { sender: "bot", text: answer }]);
        console.log("Lesson Completed! Summary:", {
          strengths,
          weaknesses,
          tips,
        });
        speak(answer); // Use speak from context
      } else {
        setMessages((m) => [...m, { sender: "bot", text: answer }]);
        setBotSpeech(answer); // Update bot speech in context
        speak(answer); // Use speak from context
      }
    } catch (err) {
      console.error("Error sending message to chat:", err);
      if (axios.isAxiosError(err)) {
        console.error("Axios chat error response:", err.response?.data);
      }
      const errorMessage = "אני מצטער, אירעה שגיאה. אנא נסה שוב.";
      setMessages((m) => [...m, { sender: "bot", text: errorMessage }]);
      setBotSpeech(errorMessage); // Update bot speech in context
      speak(errorMessage); // Use speak from context
    }
  };

  // Cleanup for silence timer
  useEffect(() => () => clearTimeout(silenceTimerRef.current!), []);

  // Scan callbacks
  const handleDrawingScan = async (canvas: HTMLCanvasElement) => {
    try {
      const mathText = await scanMathFromCanvas(canvas);
      if (mathText) {
        sendTranscript(mathText);
      } else {
        console.warn("Tesseract: לא זוהה טקסט מתמטי");
      }
    } catch (err) {
      console.error("Math OCR failed:", err);
    } finally {
      setResetKey((k) => k + 1); // Reset drawing panel
    }
  };

  const handleKeyboardScan = (displayedText: string) => {
    if (!displayedText) return;
    sendTranscript(displayedText);
    setResetKey((k) => k + 1); // Reset keyboard panel
  };

  // This function is passed to the ControlPanelProvider for navigation
  // and will be used by ControlPanel via its props.
  const handleReturnToMainActual = useCallback(() => {
    stopTTS(); // Stop Text-to-Speech (from context)
    if (recorderRef.current) {
      recorderRef.current.stopListening(); // Call stopListening method from RealTimeRecorder
    }
    navigate("/home");
  }, [stopTTS, navigate]);

  // Render loading state if messages haven't been loaded yet
  if (!messagesLoaded) {
    return <div className="loading-container">טוען שיעור...</div>;
  }

  return (
    <div className="learning-session-container">
      <button
        className="return-home-button"
        onClick={handleReturnToMainActual}
        title="Return to Home"
      >
        <img src="/logo.png" alt="MathVenture Logo" className="logo-image" />
      </button>
      {/* <div className="toggle-button-fixed">
        <ToggleControlButton
          isOpen={isVisible} // From context
          onClick={() => setIsVisible(!isVisible)} // From context
        />
      </div> */}

      {/* Pass all context values as props to ControlPanel */}
      <ControlPanel
        progress={progress}
        currentQuestion={currentQuestion}
        correctAnswers={correctAnswers}
        isLessonComplete={isLessonComplete}
        isVisible={isVisible}
        isPlaying={isPlaying}
        isMuted={isMuted}
        botVolume={botVolume}
        speechSpeed={speechSpeed}
        onTogglePlayPause={onTogglePlayPause}
        onAdjustVolume={onAdjustVolume}
        onAdjustSpeed={onAdjustSpeed}
        onToggleMute={onToggleMute}
        onReturnToMain={handleReturnToMainActual} // Pass the actual handler
        onRepeatMessage={onRepeatMessage}
      />

      <div className="main-content-panels">
        <div className="bot-status-panel">
          <div className="bot-status-display">
            <SpeakingIndicator
              isSpeaking={isPlaying}
              audioElement={currentAudioElement}
            />
            {botStatus}
          </div>{" "}
          {/* From context */}
          <Avatar />
          <div className="bot-speech-display">{botSpeech}</div>{" "}
          {/* From context */}
          <div className="current-attempts-display">
            מספר ניסיונות בשאלה זו: {backendCurrentQuestionAttempts}{" "}
            {/* Still from local lessonDetails state */}
          </div>
          <button
            onClick={() => setIsTranscriptOpen(true)}
            className="show-transcript-button"
          >
            הצג תמלול שיחה
          </button>
        </div>
        <div className="input-panel">
          <div className="tab-buttons-container">
            <button
              className={`tab-button ${
                activeTab === "draw"
                  ? "tab-button-active"
                  : "tab-button-inactive"
              }`}
              onClick={() => setActiveTab("draw")}
              disabled={isLessonComplete} // From context
            >
              ציור
            </button>
            <button
              className={`tab-button ${
                activeTab === "keyboard"
                  ? "tab-button-active"
                  : "tab-button-inactive"
              }`}
              onClick={() => setActiveTab("keyboard")}
              disabled={isLessonComplete} // From context
            >
              מחשבון
            </button>
          </div>
          {isLessonComplete ? ( // From context
            <div className="lesson-complete-message">
              כל הכבוד! סיימת את השיעור בהצלחה!
            </div>
          ) : activeTab === "draw" ? (
            <DrawingPanel key={resetKey} onScan={handleDrawingScan} />
          ) : (
            <KeyboardPanel key={resetKey} onScan={handleKeyboardScan} />
          )}
        </div>
      </div>

      <RealTimeRecorder
        ref={recorderRef}
        micMuted={isMuted || isLessonComplete || isPlaying} // Use isMuted and isPlaying from context
        onTranscript={handleTranscript}
      />
      {isTranscriptOpen && (
        <TranscriptModel
          messages={messages}
          onClose={() => setIsTranscriptOpen(false)}
        />
      )}
    </div>
  );
}

// The main LearningSession export that wraps LearningSessionContent with the provider
export default function LearningSession() {
  const navigate = useNavigate();
  const recorderRef = useRef<any>(null); // Still need this ref for the recorder

  // This function is passed to the ControlPanelProvider
  const handleReturnToMainForProvider = useCallback(() => {
    // This is the function that the ControlPanel will eventually call via its props.
    // It's passed into the provider, which then makes it available via the context,
    // and finally LearningSessionContent extracts it from context to pass as a prop to ControlPanel.
    if (recorderRef.current) {
      recorderRef.current.stopListening();
    }
    navigate("/home");
  }, [navigate]);

  return (
    <ControlPanelProvider onReturnToMain={handleReturnToMainForProvider}>
      <LearningSessionContent />
    </ControlPanelProvider>
  );
}
