import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Avatar3D from '../components/Avatar3D';
import Transcript from '../components/Transcript';
import DrawableMathNotebook from '../components/DrawableMathNotebook';
import LessonButtons from '../components/LessonButtons';
import RealTimeRecorder from '../components/RealTimeRecorder';
import AudioUnlocker from '../components/AudioUnlocker';
import './InSession.css';
import { startLesson } from '../services/lessons_api'; 

const DIRECT_MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

const InSession: React.FC = () => {
  const location = useLocation() as { state: { topic: { question: string; subject: any } } };
  const { topic } = location.state || {};

  // Separate states for user input and AI output.
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [aiTranscript, setAiTranscript] = useState<string>('');

  // Other states.
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('לחץ "התחל שיחה" כדי לפתוח את השיחה');
  const [listening, setListening] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // New state to store lesson information.
  const [lessonId, setLessonId] = useState<string>('');

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasStarted || processing || !userTranscript.trim()) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setListening(false);
      processTranscript(userTranscript);
    }, 2500);
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [userTranscript, processing, hasStarted]);

  const processTranscript = async (input: string) => {
    try {
      setProcessing(true);
      setStatus('מעבד את הבקשה שלך...');
      setUserTranscript('');
      const chatResponse = await axios.post(
        `${socketServerUrl}/api/chat`,
        { question: input, context: topic || {}, lessonId },
        { headers: { Authorization: 'jwt ' + localStorage.getItem('accessToken') } }
      );
      const aiText: string = chatResponse.data.answer;
      setAiTranscript(aiText);

      setStatus('ממיר טקסט לדיבור...');
      const ttsResponse = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText, lang: 'he-IL' },
        { responseType: 'arraybuffer' }
      );
      const audioBlob = new Blob([ttsResponse.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setStatus('מדבר...');
      setIsSpeaking(true);
      audio.play().then(() => {
        audio.onended = () => {
          setIsSpeaking(false);
          setStatus('מקשיב...');
          setListening(true);
          setProcessing(false);
        };
      }).catch(err => {
        console.error('Audio play failed:', err);
        setProcessing(false);
      });
    } catch (err) {
      console.error('Error processing transcript:', err);
      setStatus('שגיאה בעיבוד הטקסט');
      setProcessing(false);
    }
  };

  const handleStartConversation = async () => {
    try {
      setStatus('מנסה להתחיל...');
      const lesson = await startLesson({ subject: JSON.stringify(topic.subject) });
      setLessonId(lesson._id);
      setHasStarted(true);
      setListening(true);
      setStatus('מקשיב...');
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') await audioCtx.resume();
    } catch (err) {
      console.error('Error starting conversation:', err);
      setStatus('שגיאה בהתחלת השיחה');
    }
  };

  const resetConversation = () => {
    setUserTranscript('');
    setAiTranscript('');
    setIsSpeaking(false);
    setListening(true);
    setProcessing(false);
    setStatus('מוכן');
  };

  if (!hasStarted) {
    return (
      <div className="in-session-page">
        <AudioUnlocker />
        <div className="session-container">
          <div className="start-container">
            <button onClick={handleStartConversation} className="start-button">
              התחל שיחה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="in-session-page">
      <AudioUnlocker />
      <div className="session-container">
        <div className="chat-area">
          <Avatar3D
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking}
            speech={aiTranscript || userTranscript}
            fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
          />
          <Transcript text={aiTranscript || userTranscript} isLoading={processing} />
          {listening && <RealTimeRecorder onTranscript={setUserTranscript} />}
        </div>
        <div className="lesson-buttons-area">
          <LessonButtons />
        </div>
        <div className="status-display">
          <p>סטטוס: {status}</p>
        </div>
        <div className="helper-buttons">
          <button onClick={resetConversation} className="reset-button">
            אתחל שיחה
          </button>
        </div>
        <DrawableMathNotebook
          question={topic.question}
          onRecognize={processTranscript}
        />
      </div>
    </div>
  );
};

export default InSession;
