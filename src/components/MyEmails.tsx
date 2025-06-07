"use client"

import { useEffect, useState } from "react"
import "./MyEmails.css"
import axios from "axios"
const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000"

interface Email {
  _id: string
  userID: string
  to: string
  subject: string
  message: string
  status: string
  createdAt: string
}

interface EmailTableProps {
  userId: string
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return (
        <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    case "sent":
      return (
        <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    case "failed":
      return (
        <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    default:
      return (
        <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
  }
}

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <div className={`status-badge ${status.toLowerCase()}`}>
      <StatusIcon status={status} />
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  )
}

export default function EmailTable({ userId }: EmailTableProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true)
      setError(null)
      try {
        console.log("URL: ", `${baseUrl}/email/getAllEmails`)
        const accessToken = localStorage.getItem("accessToken")

        // Check if we're in development/preview mode
        if (!baseUrl || baseUrl.includes("localhost")) {
          console.warn("API endpoint not available, using mock data for preview")
          // Simulate network delay
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Use mock data for preview/development
          const mockEmails = [
            {
              _id: "1",
              userID: userId,
              to: "child@example.com",
              subject: "Welcome to our fun platform! 🎉",
              message: "Hi there! Welcome to our amazing platform where learning is fun!",
              status: "delivered",
              createdAt: "2024-01-15T10:30:00Z",
            },
            {
              _id: "2",
              userID: userId,
              to: "parent@example.com",
              subject: "Daily Progress Report 📊",
              message: "Here's your child's daily progress report with all the fun activities completed today!",
              status: "sent",
              createdAt: "2024-01-14T15:45:00Z",
            },
            {
              _id: "3",
              userID: userId,
              to: "child@example.com",
              subject: "New Adventure Unlocked! 🗝️",
              message: "Congratulations! You've unlocked a new adventure in our learning world!",
              status: "failed",
              createdAt: "2024-01-13T09:15:00Z",
            },
          ]
          setEmails(mockEmails)
          return
        }

        const response = await axios.get<Email[]>(`${baseUrl}/email/getAllEmails`, {
          params: { userID: userId },
          headers: { Authorization: `jwt ${accessToken}` },
          timeout: 10000, // 10 second timeout
        })

        setEmails(response.data)
      } catch (err: any) {
        console.error("Error fetching emails:", err)

        // Provide more detailed error information
        let errorMessage = "Unknown error"
        if (err.code === "NETWORK_ERROR" || err.message === "Network Error") {
          errorMessage = "Cannot connect to server. Please check your internet connection or try again later."
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please try again."
        } else if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.statusText}`
        } else {
          errorMessage = err.message || "Unknown error"
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    if (userId) {
      fetchEmails()
    }
  }, [userId, baseUrl])

  if (loading) {
    return (
      <div className="email-page">
        <div className="email-card">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">Loading your emails...</h3>
            <p className="loading-text">Just a moment while we fetch your messages! 📧</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="email-page">
        <div className="email-card">
          <div className="error-container">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="email-page">
      <div className="email-card">
        {/* Header */}
        <div className="email-header">
          <div className="email-header-content">
            <div className="email-header-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="email-header-title">📧 הודעות שנשלחו</h2>
              <p className="email-header-subtitle">All your sent messages in one place!</p>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="email-table-container">
          {emails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="empty-state-title">No emails yet! 📭</h3>
                <p className="empty-state-text">When you send emails, they'll appear here like magic! ✨</p>
              </div>
            </div>
          ) : (
            <table className="email-table">
              <thead>
                <tr>
                  <th>📧 To</th>
                  <th>📝 Subject</th>
                  <th>💬 Message</th>
                  <th>📊 Status</th>
                  <th>🕐 Sent At</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr key={email._id}>
                    <td>
                      <div className="recipient-cell">
                        <div className="recipient-avatar">{email.to.charAt(0).toUpperCase()}</div>
                        <div className="recipient-email">{email.to}</div>
                      </div>
                    </td>
                    <td>
                      <div className="subject-cell">{email.subject}</div>
                    </td>
                    <td>
                      <div className="message-cell">{email.message}</div>
                    </td>
                    <td>
                      <StatusBadge status={email.status} />
                    </td>
                    <td>
                      <div className="date-cell">
                        {new Date(email.createdAt).toLocaleDateString("he-IL", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {emails.length > 0 && (
          <div className="email-footer">
            <span>📊 Total emails: {emails.length}</span>
            <span>🔄 Last updated: {new Date().toLocaleTimeString("he-IL")}</span>
          </div>
        )}
      </div>
    </div>
  )
}
