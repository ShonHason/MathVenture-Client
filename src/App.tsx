import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { LessonsProvider } from "./context/LessonsContext";

import LoginRegistration from "./pages/login";
import HomePage from "./pages/HomePage";
import Lessons from "./components/Lessons";
import InSession from "./pages/InSession";
import QuizPage from "./pages/quiz";
import ChoosePlanPage from "./pages/plan";
import HelpPage from "./pages/HelpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import PageNotFound from "./pages/PageNotFound";
import {ChatPage} from "./pages/chat";
import StartLessons from "./pages/StartLessons";
import DrawableMathNotebook from "./components/DrawableMathNotebook";

const App: React.FC = () => (
  <LessonsProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginRegistration />} />

        <Route path="/home" element={<HomePage />}>
          <Route path="lessons" element={<Lessons />} />
          {/* resume or start-in-session */}
          <Route path="lessons/:lessonId" element={<InSession />} />

          <Route path="help" element={<HelpPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="start-lessons" element={<StartLessons />} />
        </Route>

        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/plan" element={<ChoosePlanPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/scan"
          element={
            <DrawableMathNotebook
              question=""
              onRecognize={() => {
                /* no-op */
              }}
            />
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  </LessonsProvider>
);

export default App;
