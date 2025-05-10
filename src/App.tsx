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
import QuizPage from "./pages/quiz";
import HelpPage from "./pages/HelpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { ChatPage } from "./pages/chat";
import StartLessons from "./pages/StartLessons";
import MyLessons from "./pages/MyLessons";
import InSession from "./pages/InSession";
import PageNotFound from "./pages/PageNotFound";

import LessonsContext, { Topic } from "./context/LessonsContext";
import { DisplaySettingsProvider } from "./context/DisplaySettingsContext";
import { UserProvider } from "./context/UserContext";

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  return (
    <LessonsContext.Provider value={{ topics, setTopics }}>
      <DisplaySettingsProvider>
        <UserProvider>
          <Router>
            <Routes>
              {/* redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* authentication */}
              <Route path="/login" element={<LoginRegistration />} />

              {/* protected home area with nested routes */}
              <Route path="/home" element={<HomePage />}>
                {/* default inside /home */}
                <Route index element={<Navigate to="myLessons" replace />} />

                <Route path="myLessons" element={<MyLessons />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="start-lessons" element={<StartLessons />} />
              </Route>
              <Route path="start-lessons/:topicName" element={<InSession />} />

              {/* other top-level pages */}
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/chat" element={<ChatPage />} />

              {/* 404 */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>

            {/* global toast container */}
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
        </UserProvider>
      </DisplaySettingsProvider>
    </LessonsContext.Provider>
  );
};

export default App;
