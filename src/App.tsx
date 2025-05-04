// src/App.tsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginRegistration from "./pages/login";
import HomePage from "./pages/HomePage";
import Lessons from "./components/Lessons";
import PageNotFound from "./pages/PageNotFound";
import QuizPage from "./pages/quiz";
import HelpPage from "./pages/HelpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { ChatPage } from "./pages/chat";
import StartLessons from "./pages/StartLessons";
import MyLessons from "./pages/MyLessons";
import InSession from "./pages/InSession";

import LessonsContext, { Topic } from "./context/LessonsContext";
import { DisplaySettingsProvider } from "./context/DisplaySettingsContext";

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  return (
    // 1) מכניסים את LessonsContext לכל האפליקציה
    <LessonsContext.Provider value={{ topics, setTopics }}>
      {/* 2) מכניסים גם את DisplaySettingsContext (הצבעים, גודל פונטים, ניגודיות) */}
      <DisplaySettingsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginRegistration />} />
            <Route path="/home" element={<HomePage />}>
              <Route path="myLessons" element={<MyLessons />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="start-lessons" element={<StartLessons />} />
              <Route path="start-lessons/:topicName" element={<InSession />} />
            </Route>
            <Route path="/lessons" element={<InSession />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>

          {/* ToastContainer גלובלי */}
          <ToastContainer
            position="bottom-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
          />
        </Router>
      </DisplaySettingsProvider>
    </LessonsContext.Provider>
  );
};

export default App;
