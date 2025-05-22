// src/components/KeyboardPanel.tsx
"use client"

import { useState } from "react"
import { RefreshCw, Scan } from "lucide-react"

interface KeyboardPanelProps {
  onScan: (text: string) => void
}

export default function KeyboardPanel({ onScan }: KeyboardPanelProps) {
  const [display, setDisplay] = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleNumberClick = (num: number) => {
    if (hasCalculated) {
      setDisplay(num.toString())
      setHasCalculated(false)
    } else {
      setDisplay(prev => prev + num.toString())
    }
  }

  const handleOperatorClick = (operator: string) => {
    setHasCalculated(false)
    setDisplay(prev => prev + operator)
  }

  const handleClear = () => {
    setDisplay("")
    setHasCalculated(false)
  }

  const handleDelete = () => {
    setDisplay(prev => prev.slice(0, -1))
  }

  const handleEquals = () => {
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${display}`)()
      setDisplay(result.toString())
      setHasCalculated(true)
    } catch {
      setDisplay("Error")
      setHasCalculated(true)
    }
  }

  const handleScanClick = () => {
    onScan(display)
  }

  const handleReset = () => {
    setDisplay("")
    setHasCalculated(false)
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-blue-50 rounded-xl mb-4 p-4 relative border-2 border-blue-100">
        <div className="bg-white p-4 mb-4 rounded-lg text-right text-2xl font-mono h-16 flex items-center justify-end overflow-hidden border-2 border-blue-200">
          <div className="overflow-x-auto whitespace-nowrap w-full">
            {display || "0"}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 flex-1">
          <button
            className="bg-red-400 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-red-500"
            onClick={handleClear}
          >
            AC
          </button>
          <button
            className="bg-purple-400 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-purple-500"
            onClick={() => handleOperatorClick("(")}
          >
            (
          </button>
          <button
            className="bg-purple-400 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-purple-500"
            onClick={() => handleOperatorClick(")")}
          >
            )
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-blue-600"
            onClick={() => handleOperatorClick("/")}
          >
            ÷
          </button>

          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(7)}
          >
            7
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(8)}
          >
            8
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(9)}
          >
            9
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-blue-600"
            onClick={() => handleOperatorClick("*")}
          >
            ×
          </button>

          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(4)}
          >
            4
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(5)}
          >
            5
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(6)}
          >
            6
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-blue-600"
            onClick={() => handleOperatorClick("-")}
          >
            -
          </button>

          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(1)}
          >
            1
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(2)}
          >
            2
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleNumberClick(3)}
          >
            3
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-blue-600"
            onClick={() => handleOperatorClick("+")}
          >
            +
          </button>

          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100 col-span-2"
            onClick={() => handleNumberClick(0)}
          >
            0
          </button>
          <button
            className="bg-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-gray-100 border-2 border-blue-100"
            onClick={() => handleOperatorClick(".")}
          >
            .
          </button>
          <button
            className="bg-green-500 text-white rounded-lg p-4 font-bold text-xl shadow-md hover:bg-green-600"
            onClick={handleEquals}
          >
            =
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleScanClick}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Scan className="h-5 w-5" />
          <span>סריקה</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>איפוס</span>
        </button>
      </div>
    </>
  )
}
