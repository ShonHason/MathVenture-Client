import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Rocket } from "lucide-react";
import { Button } from "../components/ui/button";
import GameBoard from "../components/game-board";
import StationInfoPanel from "../components/station-info-panel";
import "./LearningBoard.css";
import { useUser } from "../context/UserContext";
import SubjectsByGrade from "../components/SubjectByGrade";
import { checkOpenLesson, startLesson } from "../services/lessons_api";
import { toast } from "react-toastify";

export default function LearningBoard() {
  const { user } = useUser();
  const grade = user?.grade || "";
  const navigate = useNavigate();

  const subjectList = SubjectsByGrade[grade] || [];
  const stations = subjectList.map((subject, index) => ({
    id: index + 1,
    name: subject,
    description: `בואו ללמוד איתי על ${subject}`,
    color: ["white"][index % 10],
    icon: ["🚀", "📝", "🔢", "🎨", "🐶", "🌟", "🎵", "📚", "🧩", "🔬"][
      index % 10
    ],
  }));

  const [currentStationId, setCurrentStationId] = useState(1);

  if (!stations.length) {
    return (
      <div className="fun-container">
        <header className="fun-header">
          <h1>Learning Adventure</h1>
          <p>כיתה {grade} - אין נושאים זמינים כרגע 🙁</p>
        </header>
      </div>
    );
  }

  const currentStation =
    stations.find((s) => s.id === currentStationId) || stations[0];

  const handlePrevious = () => setCurrentStationId((id) => Math.max(1, id - 1));
  const handleNext = () =>
    setCurrentStationId((id) => Math.min(stations.length, id + 1));

  const handleStartFun = async () => {
    if (!user?._id) return;
    try {
      console.log("Checking if lesson is open for user:", user._id);
      const { isOpen } = await checkOpenLesson(user._id, currentStation.name);
      console.log("Is lesson open:", isOpen);

      if (isOpen) {
        toast.warning(
          "כבר התחלת שיעור בנושא הזה. עבור לדף 'השיעורים שלי' כדי להמשיכו."
        );
        return;
      }

      // No open lesson, start a new one
      const startResp = await startLesson(user, currentStation.name);
      // Extract lessonId from response (field name may vary)
      const newLessonId =
        (startResp as any).lessonId ??
        (startResp as any).id ??
        (startResp as any)._id;
      if (!newLessonId) {
        console.error("No lessonId returned from startLesson:", startResp);
        toast.error("שגיאה ביצירת שיעור: מזהה לא חזר");
        return;
      }
      console.log("Started lesson with ID:", newLessonId);

      // Navigate to the new lesson with its ID
      navigate(`/start-lessons/${encodeURIComponent(currentStation.name)}`, {
        state: {
          topic: { subject: currentStation.name, question: "" },
          lessonId: newLessonId,
        },
      });
    } catch (err) {
      console.error("Error checking or starting lesson:", err);
      toast.error("שגיאה בבדיקת או פתיחת שיעור");
    }
  };

  return (
    <div className="fun-container">
      {/* <div className="clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
        <div className="cloud cloud-4"></div>
      </div> */}

      <header className="fun-header">
        <h1>Learning Adventure</h1>
        <p>כיתה {grade} — נושאים מותאמים אישית 🎓</p>
      </header>

      <div className="fun-content">
        <StationInfoPanel
          station={currentStation}
          totalStations={stations.length}
        />

        <div className="game-container">
          <div className="navigation-controls" dir="rtl">
            <Button
              className="nav-button next-button"
              onClick={handleNext}
              disabled={currentStationId === stations.length}
            >
              <ChevronRight className="h-5 w-5" />
              <span>הבא</span>
            </Button>
            <Button className="start-button" onClick={handleStartFun}>
              <Rocket className="h-5 w-5 ml-2" />
              התחל כיף!
            </Button>
            <Button
              className="nav-button prev-button"
              onClick={handlePrevious}
              disabled={currentStationId === 1}
            >
              <span>הקודם</span>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          <GameBoard stations={stations} currentStationId={currentStationId} />
        </div>
      </div>

      <div className="fun-footer">
        <div className="character character-left"></div>
        <div className="character character-right"></div>
      </div>
    </div>
  );
}
