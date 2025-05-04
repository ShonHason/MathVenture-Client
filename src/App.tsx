import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginRegistration from "./pages/login";
import HomePage from "./pages/HomePage";
import Lessons from "./components/Lessons";
import PageNotFound from "./pages/PageNotFound";
import LessonsContext, { Topic } from "./context/LessonsContext";
import QuizPage from "./pages/quiz";
import ChoosePlanPage from "./pages/plan";
import HelpPage from "./pages/HelpPage";
// import HelpContext from "./context/HelpContext";
// import Help from "./pages/Help";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { ChatPage } from "./pages/chat";
import StartLessons from "./pages/StartLessons";
import Lesson from "./pages/Lesson";
import InSession from "./pages/InSession";
import DrawableMathNotebook from "./components/DrawableMathNotebook";
import { UserProvider } from "./context/UserContext";
const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  return (
    <UserProvider>
      <LessonsContext.Provider
        value={{
          topics,
          setTopics,
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginRegistration />} />
            <Route path="/home" element={<HomePage />}>
              <Route path="lessons" element={<Lessons />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="start-lessons" element={<StartLessons />} />
              <Route
                path="/home/start-lessons/:topicName"
                element={<Lesson />}
              />
            </Route>
            <Route path="/lessons" element={<InSession />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/plan" element={<ChoosePlanPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="*" element={<PageNotFound />} />
            <Route
              path="/scan"
              element={
                <DrawableMathNotebook
                  question={""}
                  onRecognize={function (text: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              }
            />
          </Routes>
        </Router>
      </LessonsContext.Provider>
    </UserProvider>
  );
};

export default App;
