import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import subjectsByGrade, {
  type SubjectsData,
} from "../components/SubjectByGrade";
import allQuestions, { type QuestionItem } from "../components/QuestionBank";
import "./quiz2.css";
import { endOfRegistration } from "../services/user_api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { SubjectSelect } from "../components/SubjectSelect";

interface QuizValues {
  username?: string;
  grade?: string;
  dateOfBirth?: string;
  imageUrl?: string;
  currentSubjects?: string[];
  parent_name?: string;
  parent_phone?: string;
  parent_phone_prefix?: string;
  parent_phone_suffix?: string;
  parent_email?: string;
  level?: string;
  [key: string]: any;
}

export default function Quiz2() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [level, setLevel] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [questionPool, setQuestionPool] = useState<QuestionItem[][]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuizValues>({
    username: "",
    grade: "",
    dateOfBirth: "",
    imageUrl: "",
    parent_name: "",
    parent_phone: "",
    parent_phone_prefix: "",
    parent_phone_suffix: "",
    parent_email: "",
    currentSubjects: [],
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = {
      username: localStorage.getItem("username") || "",
      grade: localStorage.getItem("grade") || "",
      dateOfBirth: localStorage.getItem("dateOfBirth") || "",
      parent_name: localStorage.getItem("parent_name") || "",
      parent_phone: localStorage.getItem("parent_phone") || "",
      parent_phone_prefix: localStorage.getItem("parent_phone_prefix") || "",
      parent_phone_suffix: localStorage.getItem("parent_phone_suffix") || "",
      parent_email: localStorage.getItem("parent_email") || "",
      imageUrl: localStorage.getItem("imageUrl") || "",
    };

    // Split existing phone number if it exists
    if (savedData.parent_phone && !savedData.parent_phone_prefix) {
      const phoneMatch = savedData.parent_phone.match(/^(05[0-8])(.*)/);
      if (phoneMatch) {
        savedData.parent_phone_prefix = phoneMatch[1];
        savedData.parent_phone_suffix = phoneMatch[2];
      }
    }

    setFormData((prev) => ({ ...prev, ...savedData }));

    if (savedData.imageUrl) {
      setImagePreview(savedData.imageUrl);
    }
  }, []);

  // Update questions when grade/subjects change
  useEffect(() => {
    if (!formData.grade) return;

    const relevantQuestions = allQuestions.filter((question) => {
      const gradeInRange =
        (!question.minGrade || formData.grade! >= question.minGrade) &&
        (!question.maxGrade || formData.grade! <= question.maxGrade);

      if (!question.forSubjects || !formData.currentSubjects?.length) {
        return gradeInRange;
      }

      return (
        gradeInRange &&
        question.forSubjects.some((subject) =>
          formData.currentSubjects!.includes(subject)
        )
      );
    });

    // Group questions into sets of 3
    const groupedQuestions: QuestionItem[][] = [];
    for (let i = 0; i < relevantQuestions.length; i += 3) {
      groupedQuestions.push(relevantQuestions.slice(i, i + 3));
    }

    setQuestionPool(groupedQuestions);
  }, [formData.grade, formData.currentSubjects]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Save to localStorage
      if (typeof Storage !== "undefined") {
        localStorage.setItem(
          name,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      }
      return updated;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      alert("אנא בחר קובץ תמונה בלבד");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("גודל התמונה חייב להיות קטן מ-2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImagePreview(imageUrl);
      handleInputChange("imageUrl", imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      // Validate personal info - update the phone validation
      const required = [
        "grade",
        "dateOfBirth",
        "parent_name",
        "parent_phone_prefix",
        "parent_phone_suffix",
        "parent_email",
      ];
      return required.every((field) => formData[field as keyof QuizValues]);
    }

    // Validate quiz questions
    const stepQuestions = questionPool[currentStep - 1];
    return (
      stepQuestions?.every(
        (q) => formData[q.name as keyof QuizValues] !== undefined
      ) || false
    );
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      alert("אנא מלא את כל השדות הנדרשים");
      return;
    }

    // Calculate score for quiz steps
    if (currentStep > 0) {
      const stepQuestions = questionPool[currentStep - 1];
      const stepScore = stepQuestions.reduce((sum, q) => {
        return sum + (Number(formData[q.name as keyof QuizValues]) || 0);
      }, 0);
      setTotalScore((prev) => prev + stepScore);
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    if (!validateCurrentStep()) {
      alert("אנא מלא את כל השדות הנדרשים");
      return;
    }

    // Calculate final score
    const finalStepQuestions = questionPool[currentStep - 1];
    const finalStepScore = finalStepQuestions.reduce((sum, q) => {
      return sum + (Number(formData[q.name as keyof QuizValues]) || 0);
    }, 0);

    const finalScore = totalScore + finalStepScore;
    const totalQuestions = questionPool.reduce(
      (acc, group) => acc + group.length,
      0
    );
    const avgScore = finalScore / (totalQuestions || 1);

    // Determine level
    let calculatedLevel = "";
    let mappedRank = "1";

    if (avgScore <= 2) {
      calculatedLevel = "🪱 תולעת חכמה";
      mappedRank = "1";
    } else if (avgScore <= 3.5) {
      calculatedLevel = "🐶 כלב מתמטי";
      mappedRank = "2";
    } else {
      calculatedLevel = "🐯 נמר מספרים";
      mappedRank = "3";
    }

    setLevel(calculatedLevel);

    try {
      const userDataToSend = {
        userId: user?._id ?? "",
        parent_name: formData.parent_name || "",
        parent_email: formData.parent_email || "",
        parent_phone: formData.parent_phone || "",
        grade: formData.grade || "",
        dateOfBirth: formData.dateOfBirth || "",
        rank: mappedRank,
        imageUrl: imagePreview || "",
      };

      await endOfRegistration(userDataToSend);
      console.log("Registration completed:", userDataToSend);

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              ...userDataToSend,
            }
          : null
      );
      toast.success("ההרשמה הושלמה בהצלחה! עובר לדף הבית");
      navigate("/home");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("אירעה שגיאה בהשלמת ההרשמה");
    }
  };

  const renderPersonalInfo = () => (
    <div className="step-content">
      <h2>בואו נכיר! 🌟</h2>
      <p className="step-description">
        ספר לנו קצת על עצמך כדי שנוכל להכין עבורך שאלות מיוחדות
      </p>

      <div className="form-grid">
        <div className="form-group">
          <label>באיזו כיתה אתה לומד? 📚</label>
          <select
            value={formData.grade}
            onChange={(e) => handleInputChange("grade", e.target.value)}
            className="fun-select"
          >
            <option value="">בחר כיתה</option>
            {Object.keys(subjectsByGrade).map((grade) => (
              <option key={grade} value={grade}>
                כיתה {grade}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>מתי נולדת? 🎂</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="fun-input"
          />
        </div>

        {formData.grade && (
          <div className="form-group full-width">
            <label>איזה נושאים אתה לומד עכשיו? 🎯</label>
            <SubjectSelect
              subjects={
                subjectsByGrade[formData.grade as keyof SubjectsData] || []
              }
              selectedSubjects={formData.currentSubjects || []}
              onChange={(updated: any) =>
                handleInputChange("currentSubjects", updated)
              }
            />
          </div>
        )}

        <div className="form-group">
          <label>תמונה שלך (אופציונלי) 📸</label>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="image-upload"
              className="hidden"
            />
            <label htmlFor="image-upload" className="upload-button">
              {imagePreview ? (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="image-preview"
                />
              ) : (
                <div className="upload-placeholder">
                  <span>📷</span>
                  <span>הוסף תמונה</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="parent-info">
          <h3>פרטי ההורים 👨‍👩‍👧‍👦</h3>

          <div className="form-group">
            <label>שם ההורה: </label>
            <input
              type="text"
              value={formData.parent_name}
              onChange={(e) => handleInputChange("parent_name", e.target.value)}
              placeholder="שם ההורה..."
              className="fun-input"
            />
          </div>

          <div className="form-group">
            <label>טלפון ההורה:</label>
            <div className="phone-input-container">
              <select
                value={formData.parent_phone_prefix || ""}
                onChange={(e) =>
                  handleInputChange("parent_phone_prefix", e.target.value)
                }
                className="phone-prefix-select"
              >
                <option value="">קידומת</option>
                <option value="050">050</option>
                <option value="051">051</option>
                <option value="052">052</option>
                <option value="053">053</option>
                <option value="054">054</option>
                <option value="055">055</option>
                <option value="058">058</option>
              </select>
              <input
                type="tel"
                value={formData.parent_phone_suffix || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 7);
                  handleInputChange("parent_phone_suffix", value);
                  if (formData.parent_phone_prefix && value) {
                    handleInputChange(
                      "parent_phone",
                      formData.parent_phone_prefix + value
                    );
                  }
                }}
                placeholder="1234567"
                className="phone-suffix-input"
                maxLength={7}
              />
            </div>
          </div>

          <div className="form-group">
            <label>אימייל ההורה: </label>
            <input
              type="email"
              value={formData.parent_email}
              onChange={(e) =>
                handleInputChange("parent_email", e.target.value)
              }
              placeholder="כתובת אימייל..."
              className="fun-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuestions = () => {
    if (currentStep === 0) return renderPersonalInfo();

    const stepQuestions = questionPool[currentStep - 1];
    if (!stepQuestions) return null;

    return (
      <div className="step-content">
        <h2>שאלות כיף! 🎮</h2>
        <p className="step-description">ענה על השאלות הבאות כמיטב יכולתך</p>

        <div className="questions-container">
          {stepQuestions.map((question, index) => (
            <div key={index} className="question-card">
              <label className="question-label">{question.label}</label>
              <div className="question-input">
                {React.cloneElement(
                  question.inputType as React.ReactElement,
                  {
                    value: formData[question.name as keyof QuizValues],
                    onChange: (e: any) => {
                      const value = e.target ? e.target.value : e;
                      handleInputChange(question.name, value);
                    },
                  } as any
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="result-content">
      <h1>🎉 כל הכבוד!</h1>
      <h2>הרמה שלך היא:</h2>
      <div className="level-display">{level}</div>
      <p>ההרשמה הושלמה בהצלחה!</p>
    </div>
  );

  const totalSteps = questionPool.length + 1;
  const isLastStep = currentStep === totalSteps - 1;
  const showResult = level !== null;

  if (showResult) {
    return <div className="quiz-container">{renderResult()}</div>;
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>המשך הרשמה 🚀</h1>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="step-counter">
          שלב {currentStep + 1} מתוך {totalSteps}
        </p>
      </div>

      <div className="quiz-content">{renderQuestions()}</div>

      <div className="quiz-footer">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="btn btn-secondary"
          >
            ← חזור
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            disabled={!validateCurrentStep()}
          >
            הבא →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="btn btn-success"
            disabled={!validateCurrentStep()}
          >
            סיים! 🎯
          </button>
        )}
      </div>
    </div>
  );
}
