"use client"

import { ChevronDown, ChevronUp } from "lucide-react"

interface ToggleControlButtonProps {
  isOpen: boolean
  onClick: () => void
}

export default function ToggleControlButton({ isOpen, onClick }: ToggleControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all duration-300 border-2 border-brand-blue z-50"
      aria-label={isOpen ? "סגור פקדים" : "פתח פקדים"}
    >
      {isOpen ? <ChevronUp className="h-6 w-6 text-brand-blue" /> : <ChevronDown className="h-6 w-6 text-brand-blue" />}
    </button>
  )
}
