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
import "./MyLessons.css"

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
  NOT_STARTED: <PlayCircle className="icon" />,
  IN_PROGRESS: <BookOpen className="icon" />,
  COMPLETED: <CheckCircle className="icon" />,
}

const statusColors: Record<string, string> = {
  NOT_STARTED: "status-not-started",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
}

// Simple Badge component to replace the missing import
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <span className={`badge ${className}`}>{children}</span>
}

// Simple Card component
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return <div className={`card ${className}`}>{children}</div>
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
  const baseClass = variant === "outline" ? "button-outline" : "button"
  return (
    <button className={`${baseClass} ${className}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

// Simple confetti function that doesn't require external libraries
const triggerConfetti = () => {
  const confettiContainer = document.createElement("div")
  confettiContainer.className = "confetti-container"
  document.body.appendChild(confettiContainer)

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"
    confetti.style.left = Math.random() * 100 + "vw"
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s"
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`
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

    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000"
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
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000"
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
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000"
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
      <div className="loader-container">
        <div className="loader-icon">
          <Loader2 className="spinner" />
          <div className="star-decoration">
            <Star className="star" />
          </div>
        </div>
        <p className="loader-text">טוען שיעורים...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" />
        <p className="error-text">{error}</p>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon-container">
          <BookOpen className="empty-icon" />
          <div className="star-decoration">
            <Star className="star" />
          </div>
        </div>
        <p className="empty-title">אין שיעורים פעילים כרגע</p>
        <p className="empty-subtitle">כשיהיו לך שיעורים חדשים, הם יופיעו כאן</p>
        <div className="empty-action">
          <Button className="home-button" onClick={() => navigate("/dashboard")}>
            חזרה לדף הבית
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="lessons-container" dir="rtl">
      <div className="title-container">
        <div className="title-wrapper">
          <h2 className="lessons-title">
            השיעורים שלי
            <span className="title-star">
              <Star className="star-icon" />
            </span>
          </h2>
          <div className="title-underline"></div>
        </div>
      </div>

      <div className="lessons-grid">
        {currentLessons.map((lesson) => (
          <Card
            key={lesson._id}
            className={`lesson-card ${animatedItems.has(lesson._id) ? "card-animated" : "card-hidden"}`}
          >
            <div className={`card-header ${lesson.progress.toLowerCase()}`}>
              {lesson.progress === "COMPLETED" && (
                <div className="completion-badge">
                  <Star className="badge-star" />
                </div>
              )}
              <h3 className="lesson-title">{lesson.subject}</h3>
              <div className="lesson-meta">
                <Badge className="date-badge">{formatDate(lesson.startTime)}</Badge>
                <Badge className={`status-badge ${statusColors[lesson.progress]}`}>
                  {statusLabels[lesson.progress]}
                </Badge>
              </div>
            </div>

            <div className="card-content">
              <div className="lesson-id" title={lesson._id}>
                מזהה: {lesson._id}
              </div>

              <div className="lesson-actions">
                <Button
                  className={`status-button ${statusColors[lesson.progress]}`}
                  disabled={lesson.progress === "COMPLETED"}
                  onClick={() => handleStatusClick(lesson)}
                >
                  {statusIcons[lesson.progress]}
                  {statusLabels[lesson.progress]}
                </Button>

                <div className="action-buttons">
                  <Button variant="outline" className="report-button" onClick={() => handleReport(lesson)}>
                    <FileText className="button-icon" />
                    הפק דו"ח
                  </Button>

                  <Button variant="outline" className="delete-button" onClick={() => handleDelete(lesson._id)}>
                    <Trash2 className="button-icon" />
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
        <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
            <ChevronRight className="pagination-icon" />
          </button>

          <div className="pagination-info">
            עמוד {currentPage} מתוך {totalPages}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            <ChevronLeft className="pagination-icon" />
          </button>
        </div>
      )}
    </div>
  )
}

export default MyLessons
