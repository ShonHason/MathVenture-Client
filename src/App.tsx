import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginRegistration from "./notInUse/login";
import QuizPage from "./pages/quiz";
import HelpPage from "./pages/HelpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { ChatPage } from "./pages/chat";
//import StartLessons from "./pages/StartLessons";
import MyLessons from "./pages/MyLessons";
//import InSession from "./notInUse/InSession";
import PageNotFound from "./pages/PageNotFound";
import LearningBoard from "./pages/LearningBoard";

import LessonsContext, { Topic } from "./context/LessonsContext";
import { DisplaySettingsProvider } from "./context/DisplaySettingsContext";
import { UserProvider } from "./context/UserContext";
import { AvatarProvider } from "./context/AvatarContext";
import { ActionButtonsProvider } from "./context/ActionButtonsContext";
import { DrawingSettingsProvider } from "./context/DrawingSettingsContext";
import HomeLayout from "./pages/HomeLayout";
import LearningSession from "./pages/LearningSession";
import LoginPage from "./pages/loginPage";
import MathMiniGame from "./pages/MathMiniGame";
import GameSelection from "./pages/GameSelection";
import Quiz2 from "./pages/quiz2";
import { ControlPanelProvider } from "./context/ControlPanelContext";
const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  return (
    <LessonsContext.Provider value={{ topics, setTopics }}>
      <DisplaySettingsProvider>
        <UserProvider>
          <ActionButtonsProvider>
            <AvatarProvider>
              <DrawingSettingsProvider>
                <ControlPanelProvider
                  onReturnToMain={() =>
                    (window.location.href = "/home/LearningBoard")
                  }
                >
                  <Router>
                    <Routes>
                      {/* redirect root to login */}
                      <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                      />

                      {/* authentication */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* home layout with sidebar */}
                      <Route path="/home" element={<HomeLayout />}>
                        <Route
                          index
                          element={<Navigate to="LearningBoard" replace />}
                        />
                        <Route
                          path="LearningBoard"
                          element={<LearningBoard />}
                        />
                        <Route path="myLessons" element={<MyLessons />} />
                        <Route path="help" element={<HelpPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route
                          path="learning-board"
                          element={<LearningBoard />}
                        />
                        <Route
                          path="GameSelection"
                          element={<GameSelection />}
                        />
                        <Route
                          path="math-minigame"
                          element={<MathMiniGame />}
                        />
                      </Route>

                      {/* single lesson session (not wrapped in layout) */}
                      <Route
                        path="/start-lessons/:topicName"
                        element={<LearningSession />}
                      />

                      {/* other top-level pages */}
                      <Route path="/quiz" element={<Quiz2 />} />
                      <Route path="/chat" element={<ChatPage />} />
                      {/* 404 */}
                      <Route path="*" element={<PageNotFound />} />
                    </Routes>

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
                </ControlPanelProvider>
              </DrawingSettingsProvider>
            </AvatarProvider>
          </ActionButtonsProvider>
        </UserProvider>
      </DisplaySettingsProvider>
    </LessonsContext.Provider>
  );
};

export default App;
