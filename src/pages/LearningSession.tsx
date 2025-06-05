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
import { l } from "framer-motion/dist/types.d-CtuPurYT";
import { finishLessonFunction } from "../services/lessons_api";


type LocationState = {
  state: {
    topic: { subject: string; question: string };
    lessonId?: string;
  };
};


interface AIResponse {
  text: string;
  mathexpression?: string; 
  counter?: number;       
}
interface Analytics {
  totalQuestions: number;
  correctAnswers: number;
  accuracyPct: number;
  avgResponseTimeMs: number;
  logs: Array<{
    question: string;
    questionTime: string; // ISO string from the server
    answer: string;
    answerTime: string; // ISO string from the server
    isCorrect: boolean;
    responseTimeMs: number;
  }>;
}

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

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw");
  const [resetKey, setResetKey] = useState(0);
  const [oldExp, setoldExp] = useState("");
  const [newExp, setnewExp] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
 

  const [lastUserMessage, setLastUserMessage] = useState<string>("");
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

  const currentQuestion = topic.question || "";

  const checkIfOver = async () => {
    
    console.log("Checking if lesson is over for lessonId:",lessonId);    
    try {
      
     const { data } = await axios.get(
  `${socketServerUrl}/lessons/isOver/${lessonId}`,
  {
    headers: { Authorization: `JWT ${user?.accessToken}` },
  }
);
      setQuestionCounter(data.size)
      console.log("checkIfOver response:", data);
      console.log("isfinished:", isLessonComplete);
      if (data.isOver) {
        setIsLessonComplete(true);
      }
    } catch (err) {
      console.error("Error checking isOver:", err);
    }
  };
  useEffect(() => {
    checkIfOver();
  }, []);

  useEffect(() => {
    // הפונקציה הזו תופעל רק ברגע ש־isLessonComplete יהפוך ל־true
    if (isLessonComplete) {
      if (lessonId && user) {
        finishLessonFunction(lessonId, user);
      }
    }
  }, [isLessonComplete]);

  // --- Cleanup & Back-Button Handling ---
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

        const raw = data.messages as Array<{
          role: string;
          content: string;
        }>;
        const formatted = raw.slice(1).map((m) => ({
          sender: m.role === "user" ? "user" : "bot",
          text: m.content,
        })) as { sender: "bot" | "user"; text: string }[];
        setMessages(formatted);

        // Count correct answers from chat history
        //axios function to get corrcet count.. questionlog.length
        // Look for bot responses that indicate correct answers
       
        
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

      const opening =
        messages.length > 0
          ? `שלום ${user.username}, שמח לראות שחזרת אליי! השיעור על ${topic.subject} ממשיך.`
          : `שלום ${user.username}, שמח לראות אותך! היום נלמד על ${topic.subject}.`;
      setMessages([{ sender: "bot", text: opening }]);
      setBotSpeech(opening);
      setHasSpokenIntro(true);
      speak(opening);
    }
  }, [messagesLoaded, user, topic, hasSpokenIntro, messages.length]);

  // --- Start new lesson on server ---
  useEffect(() => {
    if (hasSpokenIntro && !lessonId && user?._id) {
      axios
        .post(
          `${socketServerUrl}/lessons/start`,
          { userId: user._id, subject: topic.subject },
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
        )
        .then((r) => setLessonId(r.data.lessonId))
        .catch(console.error);
    }
  }, [hasSpokenIntro, lessonId, user, topic]);

  useEffect(() => {
    if (!isLessonComplete) return;

    axios
      .get<Analytics>(`${socketServerUrl}/lessons/${lessonId}/analytics`)
      .then((response) => {
        // 3) Put the server’s data into your state
        setAnalytics(response.data);
      })
      .catch(console.error);
  }, [isLessonComplete, lessonId]);

  // TTS with speed control
  const speak = async (text: string) => {
    // always stop anything first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    recorderRef.current?.stopListening?.();
    setListening(false);
    setIsSpeaking(true);
    setBotStatus("...מדבר");

    try {
      console.log("🔊 speak(): requesting TTS for text:", text);
      const res = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text, lang: "he-IL", speed: speechSpeed },
        { responseType: "arraybuffer" }
      );
      console.log("🔊 speak(): received audio, constructing blob");
      const blob = new Blob([res.data], { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = botVolume / 100;
      audio.playbackRate = speechSpeed; // Set playback speed
      audioRef.current = audio;
      console.log("🔊 speak(): playing audio");
      setCurrentAudioElement(audio); // NEW: Set the audio element in state

      await audio.play();
      audio.onended = () => {
        setIsSpeaking(false); // Set speaking to false when audio ends
        setListening(true);
        setBotStatus("..מקשיב");
        setCurrentAudioElement(null); // NEW: Clear the audio element from state
      };
    } catch (err) {
      console.error("❌ speak() error:", err);
      setIsSpeaking(false);
      setListening(false);
      setBotStatus("עצור");
      setCurrentAudioElement(null); // NEW: Clear the audio element from state
    }
  };

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      setIsSpeaking(false); // Set speaking to false when stopped
      setListening(true);
      setBotStatus("עצור");
      setCurrentAudioElement(null); // NEW: Clear the audio element from state
    }
  }; // <--- תוספת הסוגר החסרה כאן

  const handleReturnToMain = () => {
    stopTTS();
    if (recorderRef.current) {
      console.log("Calling stopListening...");
      recorderRef.current.stopListening();
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




  const digitPattern = /\d/; 
  const operatorPattern = /[+\-*/^%]/; // סימני חיבור, חיסור, כפל, חילוק, חזקה, אחוז
const numberWordsPattern = /\b(אפס|אחד|שתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר|עשרים|שלושים|ארבעים|חמישים|שישים|שבעים|שמונים|תשעים|מאה|אלף|מיליון)\b/;
const fractionWordsPattern = /\b(חצי|רבע|שליש|שמינית|חמישית|עשירית)\b/;
const mathOpWordsPattern = /\b(כפול|חלק|חילק|חיבור|חיסור|חזקת|שורש|גדול מ|קטן מ|שווה ל)\b/;
const questionWordsPattern = /\b(כמה|מה התשובה|פתור|חשב)\b/;
const slashFractionPattern = /\d+\s*\/\s*\d+/; // צורה “3/4” או “  12/ 5 ”

// הפונקציה עצמה
 function isMathRelated(text: string): boolean {
  // ננטרל קידוד אותיות מיוחדות ונמיר לרישיות לצורך בדיקות insensitive
  const t = text.normalize("NFC");

  // 1) ספרה מכל כתב (Unicode digit)
  if (digitPattern.test(t)) return true;

  // 2) סימני פעולה חשבונית
  if (operatorPattern.test(t)) return true;


  // 4) תבנית “X/Y”
  if (slashFractionPattern.test(t)) return true;

  // 5) מילות מספר במילים
  if (numberWordsPattern.test(t)) return true;

  // 6) מילות שבר
  if (fractionWordsPattern.test(t)) return true;

  // 7) מילות פעולה חישובית
  if (mathOpWordsPattern.test(t)) return true;

  // 8) מילות שאלה מתמטית
  if (questionWordsPattern.test(t)) return true;

  return false;
}


  const sendTranscript = async (input: string) => {
    if (input === lastSentRef.current) return;
    lastSentRef.current = input;
  
    // 1) Append the user’s message
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setLastUserMessage(input);
  console.log("addQuestionLog is called");
  console.log("isMathRelated: ", isMathRelated(input), "\nnewExp: ", newExp , "\noldExp: ", oldExp);

    if (newExp && isMathRelated(input) && oldExp != newExp) {
      setQuestionCounter((prev) => prev + 1);
      console.log("addQustionLog is working!!!!!!!");
      const response = await axios.put(
        `${socketServerUrl}/lessons/addQustionLog`,
        { lessonId :lessonId, mathExp: newExp, text :input },
      
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
    }
    console.log("addAnswer is called");
    console.log("oldExp: ", oldExp , "\nneed to be equal newExp: ", newExp , "\nisMathRelated: ", (isMathRelated(input) || /נכונה|נכון|לא נכון|לא נכונה/.test(input)) );
   
    if (oldExp === newExp && (isMathRelated(input) || /נכונה|נכון|לא נכון|לא נכונה/.test(input)) && oldExp !== "") {
      console.log("addAnswer is working!!!!!!!!!");
      setQuestionCounter((prev) => prev);
      const response = await axios.put(
        `${socketServerUrl}/lessons/addAnswer`,
        { lessonId :lessonId,mathExp: newExp, text: input },
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
      );
    }
    try {
      const resp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
   
      
      // 2) Extract fields from server response
      const aiRaw: string = resp.data.answer;                  // full AI response (may include Markdown fences + undefined fields)
      const isCorrectFromServer: boolean = resp.data.isCorrect;
      console.log("AI raw response:", aiRaw);
      console.log("isCorrectFromServer:", isCorrectFromServer);
  
      // 3) Find the JSON braces
      const firstBrace = aiRaw.indexOf("{");
      const lastBrace = aiRaw.lastIndexOf("}");
      let onlyText: string;
      let mathExpression: string | undefined;
      let counter: number | undefined;
  
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // 4) Extract exactly from “{” to “}”
        let jsonOnly = aiRaw.slice(firstBrace, lastBrace + 1);
  
        // 5) Remove any Markdown fences (```json … ```)
        //    If it starts with “```”, drop that line.
        if (jsonOnly.startsWith("```")) {
          const firstLineEnd = jsonOnly.indexOf("\n");
          if (firstLineEnd !== -1) {
            jsonOnly = jsonOnly.slice(firstLineEnd + 1);
          }
        }
        //    If it ends with “```” at the very end, strip it too.
        if (jsonOnly.endsWith("```")) {
          jsonOnly = jsonOnly.slice(0, -3).trim();
        }
  
        // 6) Remove any `"mathexpression": undefined` or `"counter": undefined`, plus dangling commas
        jsonOnly = jsonOnly
          // remove `"mathexpression": undefined` (and optional comma)
          .replace(/"mathexpression"\s*:\s*undefined\s*,?/, "")
          // remove `"counter": undefined` (and optional comma)
          .replace(/"counter"\s*:\s*undefined\s*,?/, "")
          // remove any trailing comma before closing brace: `{ "text": "...", }` → `{ "text": "..." }`
          .replace(/,\s*}/, "}");
  
        // 7) Now attempt to parse the cleaned JSON
        try {
          const parsed = JSON.parse(jsonOnly) as AIResponse;
          console.log("Parsed AI response:", parsed);
  
          onlyText = parsed.text;
          mathExpression = parsed.mathexpression;
          counter = parsed.counter;
          console.log("addBotResponse is called");
          console.log("newExp: ",newExp , "\nisMathRelated(onlyText): ", isMathRelated(onlyText));
          if(newExp && isMathRelated(onlyText)) {
            console.log("addBotResponse is working!!!!!!!!!");
            const response = await axios.put(
              `${socketServerUrl}/lessons/addBotResponse`,
              { lessonId :lessonId,mathExp: newExp, botResponse: onlyText },
              { headers: { Authorization: `JWT ${user?.accessToken}` } }
            ) }

          if(mathExpression) {
            setoldExp(newExp);
            setnewExp(mathExpression);
            console.log("set new mathExpression:", mathExpression);
            console.log("set new counter:", counter);
          }
         
          

        } catch (e) {
          console.error("Failed to parse cleaned JSON substring:", e);
          // fallback: treat entire aiRaw as plain Hebrew feedback
          onlyText = aiRaw;
        }
      } else {
        // No valid “{…}” found → treat entire aiRaw as plain text
        onlyText = aiRaw;
      }
  
      // 8) Strip stray “*” so TTS won’t read “כוכבית”
      const aiClean = onlyText.replace(/\*/g, "");
      
  
      // 9) Push the bot’s cleaned text into messages (so it appears in chat)
      setMessages((m) => [...m, { sender: "bot", text: aiClean }]);
      setBotSpeech(aiClean);
  
      //check if the lesson is over
     checkIfOver();
  
      // 11) Finally, speak only the cleaned “text” field.
      //     (If you want to append “ מוכן לשאלה הזו?”, do it here.)
      speak(aiClean);
    } catch (err) {
      console.error(err);
    }
  };
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
      </div>

      {/* Control Panel */}
      {controlsOpen && (
        <div className="w-full max-w-3xl mb-4">
          <ControlPanel
            progress={progressPercentage}
            currentQuestion={questionCounter}
            correctAnswers={questionCounter}
            isLessonComplete={isLessonComplete}
            isVisible
            isPlaying={isSpeaking}
            isMuted={!listening}
            botVolume={botVolume}
            speechSpeed={speechSpeed}
            onTogglePlayPause={handlePlayPause}
            onToggleMute={handleMute}
            onAdjustVolume={handleAdjustVolume}
            onAdjustSpeed={handleAdjustSpeed}
            onReturnToMain={handleReturnToMain}
            onRepeatMessage={handleRepeat}
          />
        </div>
      )}

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
