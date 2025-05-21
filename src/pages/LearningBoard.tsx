    import { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
    import { Button } from "../components/ui/button";
    import GameBoard from "../components/game-board";
    import StationInfoPanel from "../components/station-info-panel";
    import "./LearningBoard.css";
    import { useUser } from "../context/UserContext";
    import SubjectsByGrade from "../components/SubjectByGrade";
    import { checkOpenLesson } from "../services/lessons_api";
    import { toast } from "react-toastify";

    export default function LearningBoard() {
    const { user } = useUser();
    const grade = user?.grade || "";
    const navigate = useNavigate();

    const subjectList = SubjectsByGrade[grade] || [];

    const stations = subjectList.map((subject, index) => ({
        id: index + 1,
        name: subject,
        description: "בואו ללמוד איתי על " + subject,
        color: ["green", "blue", "purple", "yellow", "pink", "orange", "cyan", "red", "emerald", "violet"][index % 10],
        icon: ["🚀", "📝", "🔢", "🎨", "🐶", "🌟", "🎵", "📚", "🧩", "🔬"][index % 10],
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

    const currentStation = stations.find((station) => station.id === currentStationId) || stations[0];

    const handlePrevious = () => {
        setCurrentStationId((current) => (current > 1 ? current - 1 : current));
    };

    const handleNext = () => {
        setCurrentStationId((current) => (current < stations.length ? current + 1 : current));
    };

    const handleStartFun = async () => {
        if (!user?._id) return;
      
        try {
          console.log("Checking if lesson is open for user:", user._id);
          console.log("Current station name:", currentStation.name);
          const {isOpen} = await checkOpenLesson(user._id, currentStation.name);
          console.log("Is lesson open:", isOpen);
      
          if (isOpen) {
            toast.warning("כבר התחלת שיעור בנושא הזה. עבור לדף 'השיעורים שלי' כדי להמשיכו.");
            return;
          }
          console.log("should Go to:", `/start-lessons/${encodeURIComponent(currentStation.name)}`);

          navigate(`/start-lessons/${encodeURIComponent(currentStation.name)}`, {
            state: {
              topic: { subject: currentStation.name, question: "" },
              lessonId: null,
            },
          });
        } catch (error) {
          toast.error("שגיאה בבדיקת שיעור פתוח");
          console.error(error);
          return;
        }
      }
      

    return (
        <div className="fun-container">
        <div className="clouds">
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            <div className="cloud cloud-4"></div>
        </div>

        <header className="fun-header">
            <h1>Learning Adventure</h1>
            <p>כיתה {grade} — נושאים מותאמים אישית 🎓</p>
        </header>

        <div className="fun-content">
            <StationInfoPanel station={currentStation} totalStations={stations.length} />

            <div className="game-container">
            <div className="navigation-controls" dir="rtl">
                <Button className="nav-button next-button" onClick={handleNext} disabled={currentStationId === stations.length}>
                <ChevronRight className="h-5 w-5" />
                <span>הבא</span>
                </Button>
                <Button className="start-button" onClick={handleStartFun}>
                <Rocket className="h-5 w-5 ml-2" />
                התחל כיף!
                </Button>
                <Button className="nav-button prev-button" onClick={handlePrevious} disabled={currentStationId === 1}>
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
