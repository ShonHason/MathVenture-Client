import React, { useState, useEffect } from 'react';
import Avatar3D from '../components/Avatar3D';
import LessonButtons from '../components/LessonButtons';
import Transcript from '../components/Transcript';
import './InSession.css';

// שימוש בכתובת ישירה למודל מהאינטרנט (דורסת את ה-CORS כי היא מאותו דומיין)
const DIRECT_MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

// ממשק לתשובות מהצ'אט
interface ChatResponse {
  text: string;
  question?: string;
}

const InSession: React.FC = () => {
  // מצב לתמלול הנוכחי
  const [transcriptText, setTranscriptText] = useState<string>('');
  // מצב לציון האם האווטאר מדבר
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // מצב לטעינת תשובה מהצ'אט
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // מצב לשאלה הנוכחית
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  
  // פונקציה לקבלת תשובה מהצ'אט (סימולציה)
  const fetchChatResponse = async (action: string, question?: string): Promise<ChatResponse> => {
    setIsLoading(true);
    
    // סימולציה של זמן תגובה מהשרת
    return new Promise((resolve) => {
      setTimeout(() => {
        let response: ChatResponse;
        
        switch(action) {
          case 'start':
            response = {
              text: 'שלום! אני כאן כדי לעזור לך בלימוד מתמטיקה. הנה שאלה ראשונה: כמה זה 3 + 2?',
              question: '3 + 2 = ?'
            };
            break;
          case 'time-out':
            response = {
              text: 'הפסקה קצרה. ניתן להמשיך בשיעור כשתהיה מוכן.',
            };
            break;
          case 'explanation':
            response = {
              text: `בתרגיל ${currentQuestion || '3 + 2 = ?'} עליך לחבר את המספרים. חשוב על כמה זה אם יש לך 3 פריטים ואתה מוסיף עוד 2 פריטים.`,
            };
            break;
          case 'slow':
            response = {
              text: `אסביר לאט יותר: בתרגיל ${currentQuestion || '3 + 2 = ?'}, אנחנו סופרים 3 פריטים ראשונים: אחד, שניים, שלושה. אחר כך אנחנו מוסיפים עוד 2 פריטים: ארבע, חמש. וביחד יש לנו 5 פריטים.`,
            };
            break;
          case 'scan':
            response = {
              text: `בדקתי את התשובה שלך לשאלה ${currentQuestion || '3 + 2 = ?'}. יפה מאוד! התשובה נכונה - 5. הנה שאלה חדשה: כמה זה 4 + 3?`,
              question: '4 + 3 = ?'
            };
            break;
          case 'clean':
            response = {
              text: `הלוח נוקה. אתה יכול לנסות שוב את השאלה: ${currentQuestion || '3 + 2 = ?'}`,
            };
            break;
          case 'end-lesson':
            response = {
              text: 'מסיים את השיעור. עבדת נהדר היום! השגת תוצאות טובות מאוד בפתרון תרגילי החיבור.',
            };
            break;
          default:
            response = {
              text: 'לא הבנתי את הבקשה. האם תוכל לחזור עליה?',
            };
        }
        
        setIsLoading(false);
        resolve(response);
      }, 800); // זמן סימולציה של תשובה מהשרת
    });
  };
  
  // אפקט לטעינת שאלה ראשונית בעת טעינת הדף
  useEffect(() => {
    const loadInitialQuestion = async () => {
      const response = await fetchChatResponse('start');
      setTranscriptText(response.text);
      if (response.question) {
        setCurrentQuestion(response.question);
      }
    };
    
    loadInitialQuestion();
    
    // בדיקה אם האווטאר נראה
    console.log("InSession component mounted");
  }, []);
  
  // אפקט להתחלת דיבור עם כל שינוי בטקסט
  useEffect(() => {
    if (!transcriptText || isLoading) return;
    
    // מתחילים את אנימציית הדיבור
    setIsSpeaking(true);
    console.log("Speaking started");
    
    // מדמים זמן דיבור שמתאים לאורך הטקסט
    const speakingTime = Math.min(10000, transcriptText.length * 80); // מקסימום 10 שניות
    
    const timer = setTimeout(() => {
      setIsSpeaking(false);
      console.log("Speaking stopped");
    }, speakingTime);
    
    return () => clearTimeout(timer);
  }, [transcriptText, isLoading]);
  
  // טיפול בפעולות מקומפוננטת הכפתורים
  const handleButtonAction = async (action: string) => {
    console.log(`פעולה שהתקבלה בדף InSession: ${action}`);
    
    // קבלת תשובה מהצ'אט בהתאם לפעולה
    const response = await fetchChatResponse(action);
    
    // עדכון התמלול עם התשובה שהתקבלה
    setTranscriptText(response.text);
    
    // אם יש שאלה חדשה, נעדכן אותה
    if (response.question) {
      setCurrentQuestion(response.question);
    }
    
    // טיפול במקרים מיוחדים
    if (action === 'end-lesson') {
      setTimeout(() => {
        alert('השיעור הסתיים בהצלחה!');
        // כאן אפשר להוסיף ניווט לעמוד אחר
        // history.push('/lesson-completed');
      }, 3000);
    }
  };

  return (
    <div className="in-session-page">
      <div className="session-container">
        {/* אזור האווטאר והתמלול */}
        <div className="chat-area">
          <Avatar3D 
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking} 
            speech={transcriptText} 
            fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
          />
          <Transcript text={transcriptText} isLoading={isLoading} />
        </div>
        
        {/* קומפוננטת הכפתורים עם טיפול בפעולות */}
        <LessonButtons onActionPerformed={handleButtonAction} />
        
        {/* אזור הגריד לכתיבת תשובות */}
        <div className="answer-grid">
          {currentQuestion && (
            <div className="current-question">{currentQuestion}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InSession;