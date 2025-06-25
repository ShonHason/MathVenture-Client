
"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Settings,
  BarChart,
} from "lucide-react";
import "./HelpPage.css";
type HelpPageProps = {};

const HelpPage: React.FC<HelpPageProps> = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "איך אני מתחיל ללמוד עם המורה הווירטואלי?",
      answer:
        "כדי להתחיל ללמוד, פשוט נכנס לממשק המשתמש, בחר בנושא הלימוד הרצוי והתחל לעבוד עם התרגילים שהמורה הווירטואלי מציע.",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      question: "איך אני יכול לקבל פידבק על התרגילים שלי?",
      answer:
        "המורה הווירטואלי ינתח את תשובותיך בזמן אמת ויספק לך משוב על כל תשובה, כולל הסברים על שגיאות והצעות לשיפור.",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      question: "מה לעשות אם נתקעתי בתרגיל?",
      answer:
        "אם נתקעת, תוכל לבקש עזרה נוספת מהמורה הווירטואלי או להשתמש בכלי 'עזרה' שמציע הסברים וטיפים לפתרון הבעיה.",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      question: "איך אני יכול לעקוב אחרי התקדמותי?",
      answer:
        "בדף הראשי יש פאנל שמציג את התקדמותך, כולל סטטיסטיקות על התרגילים שביצעת, ציונים והמלצות לנושאים לשיפור.",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      question: "איך אני מוסיף נושאים חדשים ללימוד?",
      answer:
        "באזור הניהול של המשתמש תוכל לבחור נושאים חדשים ללימוד מתוך קטלוג הנושאים המוצעים על ידי המערכת.",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      question: "מה קורה אם אני רוצה לשנות את רמת הקושי של השיעורים?",
      answer:
        "ניתן לשנות את רמת הקושי של השיעורים בהגדרות הפרופיל שלך, תחת האפשרות 'הגדרות לימוד'.",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleAnswer = (index: number) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="help-page-container">
      <div className="help-page">
        <div className="help-header">
          <div className="help-title-container">
            <HelpCircle className="help-icon" />
            <h1 className="help-title">עזרה</h1>
          </div>
          <p className="help-subtitle">יש לך שאלות? אנחנו כאן לעזור!</p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`faq-item ${activeIndex === index ? "active" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="faq-question" onClick={() => toggleAnswer(index)}>
                <div className="faq-question-content">
                  <div className="faq-icon">{faq.icon}</div>
                  <span>{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="faq-toggle"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.div>
              </div>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="help-footer">
          <div className="help-character">
            <img
              src="/BotPic.png"
              alt="Helper character"
              className="character-image"
            />
            <div className="speech-bubble">
              <p>אני מוכן כבר להתחיל!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
