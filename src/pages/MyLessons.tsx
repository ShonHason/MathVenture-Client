"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
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
} from "lucide-react"

// The LoaderVideo import from your original code
const LoaderVideo = process.env.PUBLIC_URL + "/Loader.mp4"

interface Lesson {
  _id: string
  subject: string
  grade: string
  startTime: string
  progress: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
}

const statusLabels: Record<Lesson["progress"], string> = {
  NOT_STARTED: "התחל",
  IN_PROGRESS: "המשך",
  COMPLETED: "הושלם",
}

const statusIcons: Record<string, React.ReactNode> = {
  NOT_STARTED: <PlayCircle className="w-5 h-5" />,
  IN_PROGRESS: <BookOpen className="w-5 h-5" />,
  COMPLETED: <CheckCircle className="w-5 h-5" />,
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "status-not-started",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
}

// Simple Badge component to replace the missing import
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
}

// Simple Card component
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>{children}</div>
}

// Simple Button component
const Button = ({
  children,
  className = "",
  disabled = false,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  variant?: "default" | "outline"
}) => {
  const baseClass = variant === "outline" 
    ? "border-2 bg-transparent rounded-full px-4 py-2.5 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
    : "text-white rounded-full px-4 py-2.5 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5";
  
  return (
    <button 
      className={`${baseClass} ${className} ${disabled ? "opacity-60 cursor-not-allowed transform-none hover:shadow-sm" : ""}`} 
      disabled={disabled} 
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Improved confetti function with more kid-friendly animation
const triggerConfetti = () => {
  const confettiContainer = document.createElement("div")
  confettiContainer.className = "fixed inset-0 z-50 pointer-events-none overflow-hidden"
  document.body.appendChild(confettiContainer)

  // Create more shapes for a more playful effect
  const shapes = ['circle', 'square', 'triangle']
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div")
    confetti.className = "absolute animate-fall"
    
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    const size = Math.random() * 15 + 8
    
    confetti.style.left = Math.random() * 100 + "vw"
    confetti.style.width = size + "px"
    confetti.style.height = size + "px"
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s"
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`
    
    if (shape === 'circle') {
      confetti.style.borderRadius = "50%"
    } else if (shape === 'triangle') {
      confetti.style.width = "0"
      confetti.style.height = "0"
      confetti.style.backgroundColor = "transparent"
      confetti.style.borderLeft = size/2 + "px solid transparent"
      confetti.style.borderRight = size/2 + "px solid transparent"
      confetti.style.borderBottom = size + "px solid " + `hsl(${Math.random() * 360}, 100%, 50%)`
    }
    
    confettiContainer.appendChild(confetti)
  }

  setTimeout(() => {
    document.body.removeChild(confettiContainer)
  }, 5000)
}

export const MyLessons: React.FC = () => {
  const { user } = useUser()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [lessonsPerPage] = useState(6)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>

    if (!user?._id) {
      retryTimer = setTimeout(() => {
        if (!user?._id) {
          setError("משתמש לא מחובר")
          setLoading(false)
        }
      }, 2000)

      return () => clearTimeout(retryTimer)
    }

    const baseUrl = process.env.SERVER_API_URL || "https://localhost:4000"
    axios
      .get<Lesson[]>(`${baseUrl}/lessons/getLessons/${user._id}`)
      .then((resp) => {
        setLessons(resp.data)
        setTotalPages(Math.ceil(resp.data.length / lessonsPerPage))
        setLoading(false)

        // Set up animation timing for each card
        const newAnimatedItems = new Set<string>()
        resp.data.forEach((lesson, index) => {
          setTimeout(() => {
            setAnimatedItems((prev) => {
              const updated = new Set(prev)
              updated.add(lesson._id)
              return updated
            })
          }, index * 150) // Stagger the animations
        })
      })
      .catch((err) => {
        setLoading(false)
        if (err.response?.status === 404) {
          setError("אין שיעורים פעילים")
        } else {
          setError("שגיאה בטעינת השיעורים")
        }
      })
  }, [user, lessonsPerPage])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  const handleStatusClick = (lesson: Lesson) => {
    if (lesson.progress !== "COMPLETED") {
      navigate(`/start-lessons/${encodeURIComponent(lesson.subject)}`, {
        state: {
          topic: { question: 1 + 1, subject: lesson.subject },
          lessonId: lesson._id,
        },
      })
    } else {
      // Trigger confetti for completed lessons when clicked
      triggerConfetti()
    }
  }

  const handleReport = (lesson: Lesson) => {
    const baseUrl = process.env.SERVER_API_URL || "https://localhost:4000"
    try {
      axios.post(`${baseUrl}/lessons/report/${lesson._id}`)
      const email = localStorage.getItem("parent_email")
      if (!email) {
        alert("לא נמצאה כתובת מייל של ההורים")
        return
      }

      alert("הדוח נשלח בהצלחה לכתובת מייל ההורים")
    } catch (error) {
      console.error("Error sending report:", error)
      alert("שגיאה בשליחת הדוח")
    }
  }

  const handleDelete = async (lessonId: string) => {
    const baseUrl = process.env.SERVER_API_URL || "https://localhost:4000"
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את השיעור?")) return
    try {
      await axios.delete(`${baseUrl}/lessons/${lessonId}`)

      // Animate the card out before removing it
      setAnimatedItems((prev) => {
        const updated = new Set(prev)
        updated.delete(lessonId)
        return updated
      })

      // Remove after animation completes
      setTimeout(() => {
        setLessons((prevLessons) => {
          const updatedLessons = prevLessons.filter((lesson) => lesson._id !== lessonId)
          setTotalPages(Math.ceil(updatedLessons.length / lessonsPerPage))
          return updatedLessons
        })
      }, 300)

      alert("השיעור נמחק בהצלחה")
    } catch (error) {
      console.error("Error deleting lesson:", error)
      alert("שגיאה במחיקת השיעור")
    }
  }

  // Get current lessons for pagination
  const indexOfLastLesson = currentPage * lessonsPerPage
  const indexOfFirstLesson = indexOfLastLesson - lessonsPerPage
  const currentLessons = lessons.slice(indexOfFirstLesson, indexOfLastLesson)

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen ">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
            <div className="absolute top-0 right-0">
              <Star className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-purple-700">טוען שיעורים...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-medium text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="relative inline-block bg-blue-100 p-6 rounded-full mb-4">
            <BookOpen className="w-16 h-16 text-blue-600" />
            <div className="absolute top-0 right-0">
              <Star className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">אין שיעורים פעילים כרגע</p>
          <p className="text-lg text-gray-600 mb-6">כשיהיו לך שיעורים חדשים, הם יופיעו כאן</p>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full px-6 py-3"
            onClick={() => navigate("/home/LearningBoard")}
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block">
            <h2 className="text-3xl font-bold text-purple-800 inline-flex items-center">
              השיעורים שלי
              <span className="ml-2">
                <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
              </span>
            </h2>
            <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLessons.map((lesson) => (
            <Card
              key={lesson._id}
              className={`transform transition-all duration-500 hover:scale-105 ${
                animatedItems.has(lesson._id) ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            >
              <div className={`p-4 relative ${
                lesson.progress === "COMPLETED" 
                  ? "bg-gradient-to-r from-green-400 to-green-500" 
                  : lesson.progress === "IN_PROGRESS"
                    ? "bg-gradient-to-r from-yellow-300 to-yellow-400"
                    : "bg-gradient-to-r from-blue-400 to-blue-500"
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{lesson.subject}</h3>
                  <div className="w-9 h-9 flex items-center justify-center">
                    {lesson.progress === "COMPLETED" && (
                      <CheckCircle className="w-9 h-9 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-white/20 text-white">{formatDate(lesson.startTime)}</Badge>
                  <Badge className="bg-white/30 text-white">
                    {statusLabels[lesson.progress]}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <div className="text-xs text-gray-500 mb-4 truncate" title={lesson._id}>
                
                </div>

                <div className="space-y-4">
                  {/* Primary action button - shows Start/Continue or Report based on progress */}
                  {lesson.progress !== "COMPLETED" ? (
                    <Button
                      className={`w-full font-medium text-white ${
                        lesson.progress === "NOT_STARTED" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
                          : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                      }`}
                      onClick={() => handleStatusClick(lesson)}
                    >
                      <span className="w-5 h-5 mr-2 text-white">
                        {lesson.progress === "NOT_STARTED" 
                          ? <PlayCircle className="w-5 h-5" />
                          : <BookOpen className="w-5 h-5" />
                        }
                      </span>
                      {statusLabels[lesson.progress]}
                    </Button>
                  ) : (
                    <Button
                      className="w-full text-white bg-gradient-to-r from-blue-400 to-blue-500 opacity-40 cursor-not-allowed"
                      disabled={true}
                    >
                      <span className="w-5 h-5 mr-2 text-white">
                        <FileText className="w-5 h-5" />
                      </span>
                      <span className="text-xs">סיכום שיעור נשלח למייל</span>
                    </Button>
                  )}

                  {/* Delete button - always shows */}
                  <Button 
                    variant="outline" 
                    className="w-full border-red-400 text-red-500 hover:bg-red-50 rounded-full px-7 py-3 flex items-center justify-center gap-3 transition-all duration-200 hover:border-red-500" 
                    onClick={() => handleDelete(lesson._id)}
                  >
                    <Trash2 className="w-6 h-6" />
                    <span className="font-medium text-base">מחק</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4 space-x-reverse">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="p-2.5 rounded-full bg-white shadow-md disabled:opacity-50 transition-all duration-300 hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md"
            >
              <ChevronRight className="w-6 h-6 text-purple-700" />
            </button>

            <div className="bg-white px-5 py-2.5 rounded-full shadow-md text-purple-800 font-medium">
              עמוד {currentPage} מתוך {totalPages}
            </div>

            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="p-2.5 rounded-full bg-white shadow-md disabled:opacity-50 transition-all duration-300 hover:bg-purple-50 hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-md"
            >
              <ChevronLeft className="w-6 h-6 text-purple-700" />
            </button>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fall {
          0% { 
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% { 
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 4s ease-in-out forwards;
        }
        
        /* Add some simple animations for Tailwind to use */
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  )
}

export default MyLessons
