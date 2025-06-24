"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

interface ExpandableTextProps {
  text: string
  maxLength?: number
}

const ExpandableText = ({ text, maxLength = 25 }: ExpandableTextProps) => {
  const shouldTruncate = text.length > maxLength

  return (
    <div
      className={`expandable-text ${!shouldTruncate ? "expanded" : "collapsed"}`}
      title={shouldTruncate ? text : ""}
    >
      {shouldTruncate ? `${text.substring(0, maxLength)}...` : text}
    </div>
  )
}

export default function MyEmails({ userId }: EmailTableProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 5

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
              subject: "🎉 Welcome to our fun platform!",
              message: "Hi there! Welcome to our amazing platform where learning is fun!",
              status: "delivered",
              createdAt: "2024-01-15T10:30:00Z",
            },
            {
              _id: "2",
              userID: userId,
              to: "parent@example.com",
              subject: "📊 Daily Progress Report",
              message: "Here's your child's daily progress report with all the fun activities completed today!",
              status: "sent",
              createdAt: "2024-01-14T15:45:00Z",
            },
            {
              _id: "3",
              userID: userId,
              to: "child@example.com",
              subject: "🗝️ New Adventure Unlocked!",
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

  const handleRowDoubleClick = (email: Email) => {
    setSelectedEmail(email)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const indexOfLastEmail = currentPage * itemsPerPage
  const indexOfFirstEmail = indexOfLastEmail - itemsPerPage
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail)
  const totalPages = Math.ceil(emails.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-5 flex justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-4 w-auto">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-medium">Loading emails...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="email-component">
        <div className="email-card">
          <div className="error-container">
            <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="error-title">Oops! Something went wrong 😅</h3>
            <p className="error-text">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto ">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-100 transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 p-4 text-white">
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 rtl:text-right">
            <span className="animate-bounce inline-block">📧</span> הודעות שנשלחו
          </h2>
          <p className="text-indigo-100 text-sm">All your sent messages in one place!</p>
        </div>

        {/* Table Container */}
        <div className="p-4">
          {emails.length === 0 ? (
            <div className="text-center py-16 bg-indigo-50 rounded-xl">
              <div className="flex flex-col items-center space-y-4">
                <svg className="w-16 h-16 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-indigo-700">No emails yet! 📭</h3>
                <p className="text-indigo-600">When you send emails, they'll appear here like magic! ✨</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-inner bg-indigo-50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-200 text-indigo-800">
                    <th className="py-1 px-2 font-semibold text-left rounded-tl-lg text-xs">📧 To</th>
                    <th className="py-1 px-2 font-semibold text-left text-xs">📝 Subject</th>
                    <th className="py-1 px-2 font-semibold text-left rounded-tr-lg text-xs">💬 Message</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmails.map((email, index) => (
                    <tr 
                      key={email._id} 
                      className={`hover:bg-indigo-100 transition-colors duration-150 cursor-pointer h-6 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'
                      }`}
                      onDoubleClick={() => handleRowDoubleClick(email)}
                    >
                      <td className="py-0.5 px-2 border-b border-indigo-100">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm text-[8px]">
                            {email.to.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[11px] leading-none truncate max-w-[120px]">
                            <ExpandableText text={email.to} maxLength={15} />
                          </span>
                        </div>
                      </td>
                      <td className="py-0.5 px-2 border-b border-indigo-100">
                        <div className="font-medium text-[11px] leading-none">
                          <ExpandableText text={email.subject} maxLength={40} />
                        </div>
                      </td>
                      <td className="py-0.5 px-2 border-b border-indigo-100">
                        <div className="text-gray-600 text-[11px] leading-none">
                          <ExpandableText text={email.message} maxLength={50} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="flex justify-center items-center p-3 bg-white border-t border-indigo-100">
                <nav className="flex items-center space-x-1">
                  <button 
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    &laquo;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1 rounded text-xs font-medium ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                  >
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {emails.length > 0 && (
          <div className="bg-gray-50 px-4 py-2 flex justify-between text-xs text-indigo-600 border-t border-indigo-100">
            <span className="flex items-center gap-1 font-medium">
              <span className="inline-block">📊</span> Total emails: {emails.length}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="inline-block animate-spin-slow">🔄</span> Last updated: {new Date().toLocaleTimeString("he-IL")}
            </span>
          </div>
        )}
      </div>

      {/* Email Detail Modal */}
      {showModal && selectedEmail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all duration-300 animate-fadeIn border-4 border-indigo-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-4 text-white relative">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="animate-bounce inline-block">✉️</span> Email Details
                </h3>
                <button 
                  onClick={closeModal}
                  className="bg-white bg-opacity-20 rounded-full p-1.5 hover:bg-opacity-30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Recipient */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">To:</p>
                <div className="flex items-center border rounded-lg p-2 bg-gray-100">
                  <input type="email" value={selectedEmail.to} readOnly className="w-full bg-transparent text-gray-500" />
                  <span className="ml-2 text-gray-500">🔒</span>
                </div>
              </div>
              
              {/* Subject */}
              <div className="mb-4">
                <p className="text-xs text-gray-500">Subject:</p>
                <h4 className="text-lg font-bold text-indigo-800">{selectedEmail.subject}</h4>
              </div>
              
              {/* Message */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Message:</p>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="whitespace-pre-wrap">{selectedEmail.message}</p>
                </div>
              </div>
              
              {/* Date & Status */}
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-500">Sent on:</p>
                  <p className="font-medium">{new Date(selectedEmail.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-indigo-100 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
