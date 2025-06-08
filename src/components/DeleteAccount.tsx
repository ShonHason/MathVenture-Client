"use client"

import { useState } from "react"

const DeleteAccount = () => {
  const [password, setPassword] = useState("")

  const handleDelete = () => {
    if (password) {
      console.log("Deleting account...")
      // Here, you would typically handle the deletion by calling an API
    } else {
      alert("Please enter your password to confirm account deletion.")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-purple-300 rounded-lg shadow-lg my-4 border-2 border-purple-400 rtl">
      <div className="text-center mb-3 bg-yellow-50 p-3 rounded-lg">
        <div className="text-3xl mb-1">⚠️</div>
        <h1 className="text-xl font-bold text-gray-800">מחיקת חשבון</h1>
        <p className="text-red-500 font-semibold text-sm">פעולה זו לא ניתנת לביטול!</p>
      </div>

      <div className="space-y-3">
        <div className="mb-2">
          <label className="block text-base font-medium text-gray-700 mb-1">🔒 הכנס סיסמה לאישור:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הכנס את הסיסמה שלך"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
          <h3 className="text-lg font-bold text-orange-700 mb-2 flex items-center">
            ⚠️ שים לב!
          </h3>
          <p className="text-gray-700 mb-2 text-sm">
            מחיקת הפרופיל תסיר את כל המידע האישי שלך באופן קבוע ולא יהיה ניתן לשחזרו
          </p>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li className="flex items-center">
              <span className="ml-2">🗑️</span>
              כל הנתונים האישיים יימחקו
            </li>
            <li className="flex items-center">
              <span className="ml-2">📧</span>
              היסטוריית המיילים תאבד
            </li>
            <li className="flex items-center">
              <span className="ml-2">🏆</span>
              הישגים ורמות יאבדו
            </li>
            <li className="flex items-center">
              <span className="ml-2">📱</span>
              לא יהיה ניתן לשחזר את החשבון
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-2">
          <button 
            onClick={handleDelete} 
            className="w-full py-2 px-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
          >
            <span className="mr-2">🗑️</span>
            מחק חשבון לצמיתות
          </button>
          
          <button className="text-blue-600 hover:text-blue-800 font-medium py-1">
            חזרה למסך הראשי
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccount
