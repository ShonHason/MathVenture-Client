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
  const [email, setEmail] = useState(user?.email || "") // Add setter function
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
    setEmail(user.email || "") // Add this line to update email when user data changes
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
    <div className="max-w-5xl mx-auto p-4 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 shadow-xl rounded-xl">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-row items-center mb-4 gap-6">
        {/* Profile image moved to side */}
        <div 
          className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-indigo-500 cursor-pointer shadow-md transform hover:scale-105 transition-transform duration-300" 
          onClick={triggerImageUpload}
        >
          <img src={profileImage || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-800 bg-opacity-60 text-white text-xl font-bold opacity-0 hover:opacity-100 transition-opacity duration-300">
            📸
          </div>
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-indigo-800">פרופיל אישי</h2>
          <p className="text-sm text-indigo-600">עדכן את הפרטים האישיים שלך</p>
        </div>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm">
        {/* Column 1: הפרטים שלי */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm">
          <h3 className="text-md font-bold mb-3 text-indigo-800 border-b border-indigo-200 pb-1 flex items-center">
            <span className="bg-indigo-500 text-white p-1 rounded-lg mr-2 text-sm">👤</span>
            הפרטים שלי
          </h3>
          <div className="space-y-3">
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-indigo-700">🏷️ שם מלא</label>
              <input 
                type="text" 
                placeholder="הכנס שם מלא" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full border border-indigo-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
              />
            </div>
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-indigo-700">📧 אימייל</label>
              <div className="flex flex-row-reverse items-center border border-indigo-100 rounded-md p-2 bg-indigo-50">
                <input 
                  type="email" 
                  value={email} 
                  readOnly 
                  className="w-full bg-transparent text-indigo-800 text-left outline-none text-sm" 
                />
                <span className="mr-1 text-indigo-500 bg-indigo-200 p-1 rounded-full text-xs">🔒</span>
              </div>
            </div>
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-indigo-700">🎓 כיתה</label>
              <div className="relative">
                <select 
                  value={className} 
                  onChange={(e) => setClassName(e.target.value)} 
                  className="w-full appearance-none border border-indigo-200 rounded-md p-2 pr-8 focus:ring-1 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="">בחר כיתה</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      כיתה {g}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-indigo-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: פרטי הורים */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg shadow-sm">
          <h3 className="text-md font-bold mb-3 text-purple-800 border-b border-purple-200 pb-1 flex items-center">
            <span className="bg-purple-500 text-white p-1 rounded-lg mr-2 text-sm">👨‍👩‍👧‍👦</span>
            פרטי ההורים
          </h3>
          <div className="space-y-3">
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-purple-700">👤 שם הורה</label>
              <input 
                type="text" 
                placeholder="הכנס שם הורה" 
                value={parentName} 
                onChange={(e) => setParentName(e.target.value)} 
                className="w-full border border-purple-200 rounded-md p-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none" 
              />
            </div>
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-purple-700">📧 מייל הורה</label>
              <input 
                type="email" 
                placeholder="example@parent.com" 
                value={parentEmail} 
                onChange={(e) => setParentEmail(e.target.value)} 
                className="w-full border border-purple-200 rounded-md p-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none text-left" 
                dir="ltr"
              />
            </div>
            <div className="group">
              <label className="block text-xs font-medium mb-1 text-right text-purple-700">📱 מספר טלפון</label>
              <div className="flex items-center gap-1 direction-rtl">
                <input 
                  type="tel" 
                  className="w-2/3 border border-purple-200 rounded-md p-2 focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none" 
                  placeholder="1234567" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  dir="ltr"
                />
                <span className="text-gray-500 font-bold">-</span>
                <div className="relative w-1/3">
                  <select 
                    className="w-full appearance-none border border-purple-200 rounded-md p-2 text-center focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none text-sm" 
                    value={phonePrefix} 
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    dir="ltr"
                  >
                    <option value="">קידומת</option>
                    {prefixOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-purple-500">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button 
        className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-bold text-md" 
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
