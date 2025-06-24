// "use client";

// import type React from "react";
// import { useEffect, useState, useRef, useMemo } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContext";
// import {
//   BookOpen,
//   CheckCircle,
//   FileText,
//   Trash2,
//   PlayCircle,
//   AlertCircle,
//   Loader2,
//   Star,
//   ChevronRight,
//   ChevronLeft,
// } from "lucide-react";

// // Import the CSS file
// import "./MyLessons.css";

// // The LoaderVideo import from your original code (assuming it's still needed, though not directly used in the provided JSX)
// const LoaderVideo = process.env.PUBLIC_URL + "/Loader.mp4";

// interface Lesson {
//   _id: string;
//   subject: string;
//   grade: string;
//   startTime: string;
//   progress: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
// }

// // Keep these mappings
// const statusLabels: Record<Lesson["progress"], string> = {
//   NOT_STARTED: "התחל",
//   IN_PROGRESS: "המשך",
//   COMPLETED: "הושלם",
// };

// // These are directly used in JSX now, not as part of an object map
// // const statusIcons: Record<string, React.ReactNode> = {
// //   NOT_STARTED: <PlayCircle className="w-5 h-5" />,
// //   IN_PROGRESS: <BookOpen className="w-5 h-5" />,
// //   COMPLETED: <CheckCircle className="w-5 h-5" />,
// // }

// // Map progress to custom CSS classes for backgrounds
// const statusHeaderColors: Record<Lesson["progress"], string> = {
//   NOT_STARTED: "status-not-started",
//   IN_PROGRESS: "status-in-progress",
//   COMPLETED: "status-completed",
// };

// // Map progress to custom CSS classes for button colors
// const statusButtonColors: Record<Lesson["progress"], string> = {
//   NOT_STARTED: "bg-blue-500-hover-600",
//   IN_PROGRESS: "bg-yellow-500-hover-600",
//   COMPLETED: "bg-green-500-hover-600",
// };

// // Simple Badge component
// const Badge = ({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => {
//   return <span className={`badge ${className}`}>{children}</span>;
// };

// // Simple Card component
// const Card = ({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => {
//   return <div className={`lesson-card ${className}`}>{children}</div>;
// };

// // Simple Button component
// const Button = ({
//   children,
//   className = "",
//   disabled = false,
//   onClick,
//   variant = "default",
// }: {
//   children: React.ReactNode;
//   className?: string;
//   disabled?: boolean;
//   onClick?: () => void;
//   variant?: "default" | "outline";
// }) => {
// <<<<<<< HEAD
//   let buttonClasses = `custom-button`;
//   if (variant === "outline") {
//     buttonClasses += ` variant-outline`;
//   } else {
//     buttonClasses += ` variant-default`;
//   }
//   if (disabled) {
//     buttonClasses += ` disabled`;
//   }

//   return (
//     <button
//       className={`${buttonClasses} ${className}`}
//       disabled={disabled}
// =======
//   const baseClass = variant === "outline"
//     ? "border-2 bg-transparent rounded-full px-4 py-2.5 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
//     : "text-white rounded-full px-4 py-2.5 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5";

//   return (
//     <button
//       className={`${baseClass} ${className} ${disabled ? "opacity-60 cursor-not-allowed transform-none hover:shadow-sm" : ""}`}
//       disabled={disabled}
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//       onClick={onClick}
//     >
//       {children}
//     </button>
//   );
// };

// // Improved confetti function with more kid-friendly animation
// const triggerConfetti = () => {
//   const confettiContainer = document.createElement("div");
//   confettiContainer.className = "confetti-container";
//   document.body.appendChild(confettiContainer);

//   // Create more shapes for a more playful effect
//   const shapes = ["circle", "square", "triangle"];

//   for (let i = 0; i < 100; i++) {
//     const confetti = document.createElement("div");
//     confetti.className = "confetti-piece"; // Apply base animation class

//     const shape = shapes[Math.floor(Math.random() * shapes.length)];
//     const size = Math.random() * 15 + 8;

//     confetti.style.left = Math.random() * 100 + "vw";
//     confetti.style.width = size + "px";
//     confetti.style.height = size + "px";
//     confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
//     confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // Dynamic color

//     if (shape === "circle") {
//       confetti.style.borderRadius = "50%";
//     } else if (shape === "triangle") {
//       confetti.style.width = "0";
//       confetti.style.height = "0";
//       confetti.style.backgroundColor = "transparent";
//       confetti.style.borderLeft = size / 2 + "px solid transparent";
//       confetti.style.borderRight = size / 2 + "px solid transparent";
//       confetti.style.borderBottom =
//         size + "px solid " + `hsl(${Math.random() * 360}, 100%, 50%)`;
//     }

//     confettiContainer.appendChild(confetti);
//   }

//   setTimeout(() => {
//     document.body.removeChild(confettiContainer);
//   }, 5000);
// };

// export const MyLessons: React.FC = () => {
//   const { user } = useUser();
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
//   const navigate = useNavigate();

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [lessonsPerPage] = useState(6);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     let retryTimer: ReturnType<typeof setTimeout>;

//     if (!user?._id) {
//       retryTimer = setTimeout(() => {
//         if (!user?._id) {
//           setError("משתמש לא מחובר");
//           setLoading(false);
//         }
//       }, 2000);

//       return () => clearTimeout(retryTimer);
//     }

//     const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
//     axios
//       .get<Lesson[]>(`${baseUrl}/lessons/getLessons/${user._id}`)
//       .then((resp) => {
//         setLessons(resp.data);
//         setTotalPages(Math.ceil(resp.data.length / lessonsPerPage));
//         setLoading(false);

//         // Set up animation timing for each card
//         resp.data.forEach((lesson, index) => {
//           setTimeout(() => {
//             setAnimatedItems((prev) => {
//               const updated = new Set(prev);
//               updated.add(lesson._id);
//               return updated;
//             });
//           }, index * 150); // Stagger the animations
//         });
//       })
//       .catch((err) => {
//         setLoading(false);
//         if (err.response?.status === 404) {
//           setError("אין שיעורים פעילים");
//         } else {
//           setError("שגיאה בטעינת השיעורים");
//         }
//       });
//   }, [user, lessonsPerPage]);

//   const formatDate = (iso: string) =>
//     new Date(iso).toLocaleDateString("he-IL", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });

//   const handleStatusClick = (lesson: Lesson) => {
//     if (lesson.progress !== "COMPLETED") {
//       navigate(`/start-lessons/${encodeURIComponent(lesson.subject)}`, {
//         state: {
//           topic: { question: 1 + 1, subject: lesson.subject },
//           lessonId: lesson._id,
//         },
//       });
//     } else {
//       // Trigger confetti for completed lessons when clicked
//       triggerConfetti();
//     }
//   };

//   const handleReport = (lesson: Lesson) => {
//     const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
//     try {
//       axios.post(`${baseUrl}/lessons/report/${lesson._id}`);
//       const email = localStorage.getItem("parent_email");
//       if (!email) {
//         alert("לא נמצאה כתובת מייל של ההורים");
//         return;
//       }

//       alert("הדוח נשלח בהצלחה לכתובת מייל ההורים");
//     } catch (error) {
//       console.error("Error sending report:", error);
//       alert("שגיאה בשליחת הדוח");
//     }
//   };

//   const handleDelete = async (lessonId: string) => {
//     const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
//     if (!window.confirm("האם אתה בטוח שברצונך למחוק את השיעור?")) return;
//     try {
//       await axios.delete(`${baseUrl}/lessons/${lessonId}`);

//       // Animate the card out before removing it
//       setAnimatedItems((prev) => {
//         const updated = new Set(prev);
//         updated.delete(lessonId);
//         return updated;
//       });

//       // Remove after animation completes
//       setTimeout(() => {
//         setLessons((prevLessons) => {
//           const updatedLessons = prevLessons.filter(
//             (lesson) => lesson._id !== lessonId
//           );
//           setTotalPages(Math.ceil(updatedLessons.length / lessonsPerPage));
//           return updatedLessons;
//         });
//       }, 300);

//       alert("השיעור נמחק בהצלחה");
//     } catch (error) {
//       console.error("Error deleting lesson:", error);
//       alert("שגיאה במחיקת השיעור");
//     }
//   };

//   // Get current lessons for pagination
//   const indexOfLastLesson = currentPage * lessonsPerPage;
//   const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
//   const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);

//   // Change page
//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   if (loading) {
//     return (
//       <div className="loading-state-container">
//         <div className="loading-state-spinner-wrapper">
//           <Loader2 className="loading-state-spinner animate-spin-custom" />
//           <div className="loading-state-star-overlay">
//             <Star className="animate-bounce-custom" />
//           </div>
//         </div>
//         <p className="loading-state-text">טוען שיעורים...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-state-container">
//         <div className="error-state-box">
//           <AlertCircle />
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (lessons.length === 0) {
//     return (
//       <div className="no-lessons-state-container">
//         <div className="no-lessons-state-box">
//           <div className="no-lessons-state-icon-wrapper">
//             <BookOpen />
//             <div className="star-overlay">
//               <Star className="animate-bounce-custom" />
//             </div>
//           </div>
//           <h2>אין שיעורים פעילים כרגע</h2>
//           <p>כשיהיו לך שיעורים חדשים, הם יופיעו כאן</p>
//           <button onClick={() => navigate("/home/LearningBoard")}>
//             חזרה לדף הבית
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="my-lessons-container">
//       <div className="my-lessons-wrapper">
//         <div className="my-lessons-header">
//           <div className="inline-block">
//             <h2>
//               השיעורים שלי
//               <span className="star-icon-title">
//                 <Star className="animate-pulse-custom" />
//               </span>
//             </h2>
//             <div className="underline-div"></div>
//           </div>
//         </div>

//         <div className="lessons-grid">
//           {currentLessons.map((lesson) => (
//             <Card
//               key={lesson._id}
//               className={`${animatedItems.has(lesson._id) ? "animated" : ""}`}
//             >
// <<<<<<< HEAD
//               <div
//                 className={`lesson-card-header ${
//                   statusHeaderColors[lesson.progress]
//                 }`}
//               >
//                 {lesson.progress === "COMPLETED" && (
//                   <div className="completed-star-icon">
//                     <Star />
//                   </div>
//                 )}
//                 <h3>{lesson.subject}</h3>
//                 <div className="lesson-card-badges">
//                   <Badge className="white-alpha-20">
//                     {formatDate(lesson.startTime)}
//                   </Badge>
//                   <Badge className="white-alpha-30">
// =======
//               <div className={`p-4 relative ${
//                 lesson.progress === "COMPLETED"
//                   ? "bg-gradient-to-r from-green-400 to-green-500"
//                   : lesson.progress === "IN_PROGRESS"
//                     ? "bg-gradient-to-r from-yellow-300 to-yellow-400"
//                     : "bg-gradient-to-r from-blue-400 to-blue-500"
//               }`}>
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-xl font-bold text-white">{lesson.subject}</h3>
//                   <div className="w-9 h-9 flex items-center justify-center">
//                     {lesson.progress === "COMPLETED" && (
//                       <CheckCircle className="w-9 h-9 text-white" />
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   <Badge className="bg-white/20 text-white">{formatDate(lesson.startTime)}</Badge>
//                   <Badge className="bg-white/30 text-white">
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//                     {statusLabels[lesson.progress]}
//                   </Badge>
//                 </div>
//               </div>

// <<<<<<< HEAD
//               <div className="lesson-card-body">
//                 <div className="lesson-id" title={lesson._id}>
//                   מזהה: {lesson._id}
//                 </div>

//                 <div className="lesson-card-buttons-section">
//                   <Button
//                     className={`w-full ${statusButtonColors[lesson.progress]}`}
//                     disabled={lesson.progress === "COMPLETED"}
//                     onClick={() => handleStatusClick(lesson)}
//                   >
//                     <span
//                       className={`button-icon-large ${
//                         lesson.progress === "COMPLETED"
//                           ? "text-green-200"
//                           : "text-white"
//                       }`}
//                     >
//                       {lesson.progress === "NOT_STARTED" ? (
//                         <PlayCircle />
//                       ) : lesson.progress === "IN_PROGRESS" ? (
//                         <BookOpen />
//                       ) : (
//                         <CheckCircle />
//                       )}
//                     </span>
//                     {statusLabels[lesson.progress]}
//                   </Button>

//                   <div className="lesson-card-sub-buttons-grid">
//                     <Button
//                       variant="outline"
//                       className="border-blue-500-text-blue-600-hover-bg-blue-50"
//                       onClick={() => handleReport(lesson)}
//                     >
//                       <FileText className="button-icon-small" />
//                       הפק דו"ח
//                     </Button>

//                     <Button
//                       variant="outline"
//                       className="border-red-500-text-red-600-hover-bg-red-50"
//                       onClick={() => handleDelete(lesson._id)}
//                     >
//                       <Trash2 className="button-icon-small" />
//                       מחק
//                     </Button>
//                   </div>
// =======
//               <div className="p-4">
//                 <div className="text-xs text-gray-500 mb-4 truncate" title={lesson._id}>

//                 </div>

//                 <div className="space-y-4">
//                   {/* Primary action button - shows Start/Continue or Report based on progress */}
//                   {lesson.progress !== "COMPLETED" ? (
//                     <Button
//                       className={`w-full font-medium text-white ${
//                         lesson.progress === "NOT_STARTED"
//                           ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
//                           : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
//                       }`}
//                       onClick={() => handleStatusClick(lesson)}
//                     >
//                       <span className="w-5 h-5 mr-2 text-white">
//                         {lesson.progress === "NOT_STARTED"
//                           ? <PlayCircle className="w-5 h-5" />
//                           : <BookOpen className="w-5 h-5" />
//                         }
//                       </span>
//                       {statusLabels[lesson.progress]}
//                     </Button>
//                   ) : (
//                     <Button
//                       className="w-full text-white bg-gradient-to-r from-blue-400 to-blue-500 opacity-40 cursor-not-allowed"
//                       disabled={true}
//                     >
//                       <span className="w-5 h-5 mr-2 text-white">
//                         <FileText className="w-5 h-5" />
//                       </span>
//                       <span className="text-xs">סיכום שיעור נשלח למייל</span>
//                     </Button>
//                   )}

//                   {/* Delete button - always shows */}
//                   <Button
//                     variant="outline"
//                     className="w-full border-red-400 text-red-500 hover:bg-red-50 rounded-full px-7 py-3 flex items-center justify-center gap-3 transition-all duration-200 hover:border-red-500"
//                     onClick={() => handleDelete(lesson._id)}
//                   >
//                     <Trash2 className="w-6 h-6" />
//                     <span className="font-medium text-base">מחק</span>
//                   </Button>
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
// <<<<<<< HEAD
//           <div className="pagination-container">
//             <button
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="pagination-button"
// =======
//           <div className="flex justify-center items-center mt-8 space-x-4 space-x-reverse">
//             <button
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="p-2.5 rounded-full bg-white shadow-md disabled:opacity-50 transition-all duration-300 hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md"
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//             >
//               <ChevronRight />
//             </button>

// <<<<<<< HEAD
//             <div className="pagination-info">
//               עמוד {currentPage} מתוך {totalPages}
//             </div>

//             <button
//               onClick={() => paginate(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="pagination-button"
// =======
//             <div className="bg-white px-5 py-2.5 rounded-full shadow-md text-purple-800 font-medium">
//               עמוד {currentPage} מתוך {totalPages}
//             </div>

//             <button
//               onClick={() => paginate(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="p-2.5 rounded-full bg-white shadow-md disabled:opacity-50 transition-all duration-300 hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md"
// >>>>>>> dc7d70a4c9c7ace0e52a756ba3cb151ab3aebebb
//             >
//               <ChevronLeft />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyLessons;
"use client";

import type React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Trash2,
  PlayCircle,
  AlertCircle,
  Loader2,
  Star,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Import the CSS file
import "./MyLessons.css";

const LoaderVideo = process.env.PUBLIC_URL + "/Loader.mp4"; // Assuming this path is correct

interface Lesson {
  _id: string;
  subject: string;
  grade: string;
  startTime: string;
  progress: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

const statusLabels: Record<Lesson["progress"], string> = {
  NOT_STARTED: "התחל",
  IN_PROGRESS: "המשך",
  COMPLETED: "הושלם",
};

// Map progress to custom CSS classes for backgrounds (assuming these are defined in MyLessons.css)
const statusHeaderColors: Record<Lesson["progress"], string> = {
  NOT_STARTED: "status-not-started-header", // New specific class for header
  IN_PROGRESS: "status-in-progress-header", // New specific class for header
  COMPLETED: "status-completed-header", // New specific class for header
};

// Map progress to custom CSS classes for button colors (assuming these are defined in MyLessons.css)
const statusButtonColors: Record<Lesson["progress"], string> = {
  NOT_STARTED: "button-bg-blue",
  IN_PROGRESS: "button-bg-yellow",
  COMPLETED: "button-bg-green",
};

// Simple Badge component - adjusted classes to use your custom ones while incorporating Tailwind effects
const Badge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <span className={`badge ${className}`}>{children}</span>;
};

// Simple Card component - adjusted classes
const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={`lesson-card ${className}`}>{children}</div>;
};

// Simple Button component - Merged logic
const Button = ({
  children,
  className = "",
  disabled = false,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "outline";
}) => {
  // Your base styling
  let buttonClasses = `custom-button`;

  // Apply variant styles
  if (variant === "outline") {
    buttonClasses += ` variant-outline`;
  } else {
    buttonClasses += ` variant-default`;
  }

  // Apply disabled state
  if (disabled) {
    buttonClasses += ` disabled`;
  }

  return (
    <button
      className={`${buttonClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Improved confetti function with more kid-friendly animation
const triggerConfetti = () => {
  const confettiContainer = document.createElement("div");
  confettiContainer.className = "confetti-container";
  document.body.appendChild(confettiContainer);

  const shapes = ["circle", "square", "triangle"];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = Math.random() * 15 + 8;

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

    if (shape === "circle") {
      confetti.style.borderRadius = "50%";
    } else if (shape === "triangle") {
      confetti.style.width = "0";
      confetti.style.height = "0";
      confetti.style.backgroundColor = "transparent";
      confetti.style.borderLeft = size / 2 + "px solid transparent";
      confetti.style.borderRight = size / 2 + "px solid transparent";
      confetti.style.borderBottom =
        size + "px solid " + `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    document.body.removeChild(confettiContainer);
  }, 5000);
};

export const MyLessons: React.FC = () => {
  const { user } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [lessonsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;

    if (!user?._id) {
      retryTimer = setTimeout(() => {
        if (!user?._id) {
          setError("משתמש לא מחובר");
          setLoading(false);
        }
      }, 2000);

      return () => clearTimeout(retryTimer);
    }

    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    axios
      .get<Lesson[]>(`${baseUrl}/lessons/getLessons/${user._id}`)
      .then((resp) => {
        setLessons(resp.data);
        setTotalPages(Math.ceil(resp.data.length / lessonsPerPage));
        setLoading(false);

        resp.data.forEach((lesson, index) => {
          setTimeout(() => {
            setAnimatedItems((prev) => {
              const updated = new Set(prev);
              updated.add(lesson._id);
              return updated;
            });
          }, index * 150);
        });
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.status === 404) {
          setError("אין שיעורים פעילים");
        } else {
          setError("שגיאה בטעינת השיעורים");
        }
      });
  }, [user, lessonsPerPage]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleStatusClick = (lesson: Lesson) => {
    if (lesson.progress !== "COMPLETED") {
      navigate(`/start-lessons/${encodeURIComponent(lesson.subject)}`, {
        state: {
          topic: { question: 1 + 1, subject: lesson.subject },
          lessonId: lesson._id,
        },
      });
    } else {
      triggerConfetti();
    }
  };

  const handleReport = (lesson: Lesson) => {
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    try {
      axios.post(`${baseUrl}/lessons/report/${lesson._id}`);
      const email = localStorage.getItem("parent_email");
      if (!email) {
        alert("לא נמצאה כתובת מייל של ההורים");
        return;
      }

      alert("הדוח נשלח בהצלחה לכתובת מייל ההורים");
    } catch (error) {
      console.error("Error sending report:", error);
      alert("שגיאה בשליחת הדוח");
    }
  };

  const handleDelete = async (lessonId: string) => {
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את השיעור?")) return;
    try {
      await axios.delete(`${baseUrl}/lessons/${lessonId}`);

      setAnimatedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(lessonId);
        return updated;
      });

      setTimeout(() => {
        setLessons((prevLessons) => {
          const updatedLessons = prevLessons.filter(
            (lesson) => lesson._id !== lessonId
          );
          setTotalPages(Math.ceil(updatedLessons.length / lessonsPerPage));
          return updatedLessons;
        });
      }, 300);

      alert("השיעור נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("שגיאה במחיקת השיעור");
    }
  };

  const indexOfLastLesson = currentPage * lessonsPerPage;
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage;
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-state-container">
        <div className="loading-state-spinner-wrapper">
          <Loader2 className="loading-state-spinner animate-spin-custom" />
          <div className="loading-state-star-overlay">
            <Star className="animate-bounce-custom" />
          </div>
        </div>
        <p className="loading-state-text">טוען שיעורים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state-container">
        <div className="error-state-box">
          <AlertCircle />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="no-lessons-state-container">
        <div className="no-lessons-state-box">
          <div className="no-lessons-state-icon-wrapper">
            <BookOpen />
            <div className="star-overlay">
              <Star className="animate-bounce-custom" />
            </div>
          </div>
          <h2>אין שיעורים פעילים כרגע</h2>
          <p>כשיהיו לך שיעורים חדשים, הם יופיעו כאן</p>
          <button onClick={() => navigate("/home/LearningBoard")}>
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-lessons-container">
      <div className="my-lessons-wrapper">
        <div className="my-lessons-header">
          <div className="inline-block">
            <h2>
              השיעורים שלי
              <span className="star-icon-title">
                <Star className="animate-pulse-custom" />
              </span>
            </h2>
            <div className="underline-div"></div>
          </div>
        </div>

        <div className="lessons-grid">
          {currentLessons.map((lesson) => (
            <Card
              key={lesson._id}
              className={`${animatedItems.has(lesson._id) ? "animated" : ""}`}
            >
              {/* Lesson Card Header - Merged */}
              <div
                className={`lesson-card-header ${
                  statusHeaderColors[lesson.progress]
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {lesson.subject}
                  </h3>{" "}
                  {/* Combined attributes */}
                  {lesson.progress === "COMPLETED" && (
                    <div className="w-9 h-9 flex items-center justify-center">
                      <CheckCircle className="w-9 h-9 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="white-alpha-20 text-white">
                    {formatDate(lesson.startTime)}
                  </Badge>{" "}
                  {/* Adjusted Badge class */}
                  <Badge className="white-alpha-30 text-white">
                    {statusLabels[lesson.progress]}
                  </Badge>
                </div>
              </div>

              {/* Lesson Card Body & Buttons - Merged */}
              <div className="lesson-card-body">
                {" "}
                {/* Kept your class */}
                {/* Your lesson ID display */}
                <div className="lesson-id" title={lesson._id}>
                  {" "}
                  {/* Kept your class */}
                  מזהה: {lesson._id}
                </div>
                <div className="lesson-card-buttons-section">
                  {" "}
                  {/* Kept your class */}
                  {lesson.progress !== "COMPLETED" ? (
                    <Button
                      className={`w-full font-medium text-white ${
                        statusButtonColors[lesson.progress]
                      }`}
                      onClick={() => handleStatusClick(lesson)}
                    >
                      <span className={`button-icon-large`}>
                        {lesson.progress === "NOT_STARTED" ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : (
                          <BookOpen className="w-5 h-5" />
                        )}
                      </span>
                      {statusLabels[lesson.progress]}
                    </Button>
                  ) : (
                    <Button
                      className="w-full text-white bg-gradient-to-r from-blue-400 to-blue-500 opacity-40 cursor-not-allowed"
                      disabled={true}
                    >
                      <span className="button-icon-large">
                        <FileText className="w-5 h-5" />
                      </span>
                      <span className="text-xs">סיכום שיעור נשלח למייל</span>
                    </Button>
                  )}
                  <div className="lesson-card-sub-buttons-grid">
                    {" "}
                    {/* Kept your class */}
                    <Button
                      variant="outline"
                      className="border-blue-500-text-blue-600-hover-bg-blue-50"
                      onClick={() => handleReport(lesson)}
                    >
                      <FileText className="button-icon-small" />
                      הפק דו"ח
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500-text-red-600-hover-bg-red-50"
                      onClick={() => handleDelete(lesson._id)}
                    >
                      <Trash2 className="button-icon-small" />
                      מחק
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            {" "}
            {/* Kept your class */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button" /* Kept your class */
            >
              <ChevronRight />
            </button>
            <div className="pagination-info">
              {" "}
              {/* Kept your class */}
              עמוד {currentPage} מתוך {totalPages}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button" /* Kept your class */
            >
              <ChevronLeft />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLessons;
