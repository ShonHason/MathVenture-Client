"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DrawingPanel from "../components/drawing-panel";
import KeyboardPanel from "../components/keyboard-panel";
import Avatar from "../components/Avatar";
import TranscriptModel from "../components/transcript-model";
import ControlPanel from "../components/control-panel";
//import ToggleControlButton from "../components/ ToggleControlButton";
import RealTimeRecorder from "../components/RealTimeRecorder";
import SpeakingIndicator from "../components/SpeakingIndicator"; // Import SpeakingIndicator
import { useUser } from "../context/UserContext";
import { scanMathFromCanvas } from "../services/tesseractOcrService";
import { finishLessonFunction } from "../services/lessons_api";
import "./LearningSession.css"; // Import your CSS styles
import {
  ControlPanelProvider,
  useControlPanel,
} from "../context/ControlPanelContext"; // Import provider and hook

const socketServerUrl =
  process.env.SERVER_API_URL || "http://localhost:4000";

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

function LearningSessionContent() {
  const recorderRef = useRef<any>(null);
  const { user } = useUser();
  const {
    state: { topic, lessonId: initialLessonId },
  } = useLocation() as LocationState;
  const navigate = useNavigate();

  // --- State ---
  const [lessonId, setLessonId] = useState<string | null>(
    initialLessonId ?? null
  );
  const [messages, setMessages] = useState<
    { sender: "bot" | "user"; text: string }[]
  >([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasSpokenIntro, setHasSpokenIntro] = useState(false);
  //const [botSpeech, setBotSpeech] = useState("");
  //const [botStatus, setBotStatus] = useState("עצור");
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  //const [listening, setListening] = useState(false);
  //const [isSpeaking, setIsSpeaking] = useState(false); // This prop controls the indicator
  //const [controlsOpen, setControlsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"draw" | "keyboard">("draw");
 // const [botVolume, setBotVolume] = useState(100);
  //const [speechSpeed, setSpeechSpeed] = useState(1);

  const [resetKey, setResetKey] = useState(0);

  const [oldExp, setoldExp] = useState("");
  const [newExp, setnewExp] = useState("");
  const [questionCounter, setQuestionCounter] = useState(0);
  

  // Yellow area: last user input
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [currentAudioElement, setCurrentAudioElement] =
    useState<HTMLAudioElement | null>(null); // NEW: State for the current audio element
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptRef = useRef("");
  const lastSentRef = useRef("");


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


  // --- Fetch existing conversation ---
  useEffect(() => {
    async function fetchMessages() {
      if (!lessonId) return;
      try {
        const { data } = await axios.get(
          `${socketServerUrl}/lessons/${lessonId}/messages`,
          { headers: { Authorization: `Bearer ${user?.accessToken}` } }
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
        console.error(err);
      } finally {
        setMessagesLoaded(true);
      }
    }
    fetchMessages();
  }, [lessonId, user?.accessToken]);

  // --- Intro message ---
  useEffect(() => {
    if (
      messagesLoaded &&
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
    if (!user?._id || !topic.subject) {
      console.error(
        "Problem With Lesson: User ID or topic subject not available. Redirecting to home."
      );
      navigate("/home");
      return;
    }
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
  }, [ lessonId, user, topic]);

  useEffect(() => {
    if (!isLessonComplete) return;

  //function that send all the lesson data to the server, that it get summary and than sent to email

  }), [isLessonComplete, lessonId];

  // TTS with speed control
  

  const handleReturnToMainActual = useCallback(() => {
    stopTTS(); // Stop Text-to-Speech (from context)
    if (recorderRef.current) {
      recorderRef.current.stopListening(); // Call stopListening method from RealTimeRecorder
    }
    navigate("/home");
  }, [stopTTS, navigate]);


  const handleTranscript = (t: string) => {
    if (isMuted || isPlaying) return; 
    lastTranscriptRef.current = t;
    clearTimeout(silenceTimerRef.current!);
    silenceTimerRef.current = window.setTimeout(() => {
      const final = lastTranscriptRef.current.trim();
      if (final) sendTranscript(final);
      lastTranscriptRef.current = "";
    }, 2500);
  };





const digitPattern = /\d/; 
const operatorPattern = /[+\-*/^%]/; // סימני חיבור, חיסור, כפל, חילוק, חזקה, אחוז
const numberWordsPattern = /\b(אפס|אחד|שתיים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר|עשרים|שלושים|ארבעים|חמישים|שישים|שבעים|שמונים|תשעים|מאה|אלף|מיליון)\b/;
const fractionWordsPattern = /\b(חצי|רבע|שליש|שמינית|חמישית|עשירית)\b/;
const mathOpWordsPattern = /\b(כפול|חלק|חילק|חיבור|חיסור|חזקת|שורש|גדול מ|קטן מ|שווה ל)\b/;
const questionWordsPattern = /\b(כמה|מה התשובה|פתור|חשב)\b/;
const slashFractionPattern = /\d+\s*\/\s*\d+/; // צורה “3/4” או “  12/ 5 ”

 function isMathRelated(text: string): boolean {
  const t = text.normalize("NFC");

  if (digitPattern.test(t)) return true;

  if (operatorPattern.test(t)) return true;

  if (slashFractionPattern.test(t)) return true;

  if (numberWordsPattern.test(t)) return true;

  if (fractionWordsPattern.test(t)) return true;

  if (mathOpWordsPattern.test(t)) return true;

  if (questionWordsPattern.test(t)) return true;

  return false;
}


  const sendTranscript = async (input: string) => {
    if (input === lastSentRef.current || !input.trim()) {
      console.warn(
        "Skipping sendTranscript: empty input, duplicate, or no lessonId.",
        { input, lastSentRef: lastSentRef.current, lessonId }
      );
      return;
    }

    lastSentRef.current = input;
  
    // 1) Append the user’s message
    setMessages((m) => [...m, { sender: "user", text: input }]);
    setBotStatus("חושב..."); 

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
        { headers: { Authorization: `JWT ${user?.accessToken}` } }
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

  const handleKeyboardScan = async (displayedText: string) => {
    if (!displayedText) return;
    sendTranscript(displayedText);
    setResetKey((k) => k + 1); // Reset keyboard panel;
  };




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
          <div className="user-message-display">
          {lastUserMessage}
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