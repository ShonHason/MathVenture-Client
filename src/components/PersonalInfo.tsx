"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useUser } from "../context/UserContext"
import { updateUserProfile } from "../services/user_api"
import toast, { Toaster } from "react-hot-toast"

const gradeOptions = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]
const prefixOptions = ["050", "051", "052", "053", "054", "055", "058"]

const PersonalInfo: React.FC = () => {
  const { user, setUser } = useUser()
  const avgScore = Number(user?.rank ?? 0)
  const [isLoading, setIsLoading] = useState(false)

  const { calculatedLevel, mappedRank } = useMemo(() => {
    let calculatedLevel = ""
    let mappedRank = "1"

    if (avgScore <= 2) {
      calculatedLevel = "🪱 תולעת חכמה"
      mappedRank = "1"
    } else if (avgScore <= 3.5) {
      calculatedLevel = "🐶 כלב מתמטי"
      mappedRank = "2"
    } else {
      calculatedLevel = "🐯 נמר מספרים"
      mappedRank = "3"
    }

    return { calculatedLevel, mappedRank }
  }, [avgScore])

  const [name, setName] = useState(user?.username || "")
  const [email] = useState(user?.email || "")
  const [phonePrefix, setPhonePrefix] = useState(user?.parent_phone?.slice(0, 3) || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.parent_phone || "")
  const [className, setClassName] = useState(user?.grade || "")
  const [profileImage, setProfileImage] = useState<string>(user?.imageUrl || "/placeholder.svg?height=120&width=120")
  const [parentName, setParentName] = useState(user?.parent_name || "")
  const [parentEmail, setParentEmail] = useState(user?.parent_email || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    setName(user.username || user.fullname || "")
    setClassName(user.grade || "")
    setProfileImage(user.imageUrl || "/placeholder.svg?height=120&width=120")
    setParentName(user.parent_name || "")
    setParentEmail(user.parent_email || "")

    if (user.parent_phone) {
      const full = user.parent_phone
      const found = prefixOptions.find((p) => full.startsWith(p))
      if (found) {
        setPhonePrefix(found)
        setPhoneNumber(full.slice(found.length))
      } else {
        setPhoneNumber(full)
      }
    }
  }, [user])

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") setProfileImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const onSave = async () => {
    if (!user?._id) return
    const fullPhone = phonePrefix + phoneNumber
    setIsLoading(true)
    try {
      const updated = await updateUserProfile({
        userId: user._id,
        username: name,
        email,
        parent_phone: fullPhone,
        grade: className,
        imageUrl: profileImage,
        parent_name: parentName,
        parent_email: parentEmail,
      })
      setUser((prev) => ({ ...prev!, ...updated }))
      toast.success("השינויים נשמרו בהצלחה!")
    } catch (err) {
      console.error(err)
      toast.error("שגיאה בשמירת הפרטים")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-10 bg-purple-300 from-blue-50 to-indigo-100 shadow-md rounded-lg">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Fun header with level display
      <div className="text-center mb-6">
        <div className="inline-block bg-blue-100 p-4 rounded-lg">
          <span className="text-lg font-bold">{calculatedLevel}</span>
          <div className="flex justify-center mt-2">
            {Array.from({ length: Number.parseInt(mappedRank) }, (_, i) => (
              <span key={i} className="text-yellow-500 text-xl">⭐</span>
            ))}
          </div>
        </div>
      </div> */}

      {/* Profile image with fun styling */}
      <div className="flex flex-col items-center mb-6 ">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer" onClick={triggerImageUpload}>
          <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold opacity-0 hover:opacity-100">
            ✏️
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">📸 לחץ כדי לשנות תמונה</p>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      <div className="grid grid-cols-2 gap-6">
        {/* Column 1: הפרטים שלי */}
        <div>
          <h3 className="text-lg font-semibold mb-4">👤 הפרטים שלי</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-right">🏷️ שם מלא</label>
              <input type="text" placeholder="הכנס שם מלא" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-right">📧 אימייל</label>
              <div className="flex flex-row-reverse items-center border rounded-lg p-2 bg-gray-100">
                <input type="email" value={email} readOnly className="w-full bg-transparent text-gray-500 text-left" />
                <span className="mr-2 text-gray-500">🔒</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-right">🎓 כיתה</label>
              <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full border rounded-lg p-2">
                <option value="">בחר כיתה</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    כיתה {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Column 2: פרטי הורים */}
        <div>
          <h3 className="text-lg font-semibold mb-4">👨‍👩‍👧‍👦 פרטי ההורים</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-right">👤 שם הורה</label>
              <input type="text" placeholder="הכנס שם הורה" value={parentName} onChange={(e) => setParentName(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-right">📧 מייל הורה</label>
              <input type="email" placeholder="example@parent.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-right">📱 מספר טלפון</label>
              <div className="flex flex-row-reverse space-x-2">
                <select className="w-1/3 border rounded-lg p-2 text-right" value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value)}>
                  <option value="">קידומת</option>
                  {prefixOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input type="tel" className="w-2/3 border rounded-lg p-2" placeholder="1234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-6 flex items-center justify-center" 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            טוען...
          </>
        ) : (
          "💾 שמור שינויים"
        )}
      </button>
    </div>
  )
}

export default PersonalInfo
