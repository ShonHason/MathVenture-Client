import { useState } from "react"
import { RefreshCw, Scan } from "lucide-react"

export default function KeyboardPanel() {
  const [display, setDisplay] = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleNumberClick = (num: number) => {
    if (hasCalculated) {
      setDisplay(num.toString())
      setHasCalculated(false)
    } else {
      setDisplay((prev) => prev + num.toString())
    }
  }

  const handleOperatorClick = (operator: string) => {
    setHasCalculated(false)
    setDisplay((prev) => prev + operator)
  }

  const handleClear = () => {
    setDisplay("")
    setHasCalculated(false)
  }

  const handleDelete = () => {
    setDisplay((prev) => prev.slice(0, -1))
  }

  const handleEquals = () => {
    try {
      // Using Function constructor to safely evaluate the expression
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${display}`)()
      setDisplay(result.toString())
      setHasCalculated(true)
    } catch (error) {
      setDisplay("Error")
      setHasCalculated(true)
    }
  }

  const handleScan = () => {
    console.log("Scanning input:", display)
    // Implement scanning logic here
  }

  const handleReset = () => {
    setDisplay("")
    setHasCalculated(false)
  }

  return (
    <>
      <div className="flex-1 flex flex-col bg-blue-50 rounded-xl mb-4 p-4 relative border-2 border-blue-100">
        {/* Calculator display */}
        <div className="bg-white p-4 mb-4 rounded-lg text-right text-2xl font-mono h-16 flex items-center justify-end overflow-hidden border-2 border-blue-200">
          <div className="overflow-x-auto whitespace-nowrap w-full">{display || "0"}</div>
        </div>

        {/* Calculator buttons */}
        <div className="grid grid-cols-4 gap-3 flex-1">
          {/* First row */}
          <button
            className="bg-red-400 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-red-500 transition-colors"
            onClick={handleClear}
          >
            AC
          </button>
          <button
            className="bg-purple-400 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-purple-500 transition-colors"
            onClick={() => handleOperatorClick("(")}
          >
            (
          </button>
          <button
            className="bg-purple-400 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-purple-500 transition-colors"
            onClick={() => handleOperatorClick(")")}
          >
            )
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => handleOperatorClick("/")}
          >
            ÷
          </button>

          {/* Second row */}
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(7)}
          >
            7
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(8)}
          >
            8
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(9)}
          >
            9
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => handleOperatorClick("*")}
          >
            ×
          </button>

          {/* Third row */}
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(4)}
          >
            4
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(5)}
          >
            5
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(6)}
          >
            6
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => handleOperatorClick("-")}
          >
            -
          </button>

          {/* Fourth row */}
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(1)}
          >
            1
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(2)}
          >
            2
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleNumberClick(3)}
          >
            3
          </button>
          <button
            className="bg-blue-500 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => handleOperatorClick("+")}
          >
            +
          </button>

          {/* Fifth row */}
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors col-span-2 border-2 border-blue-100"
            onClick={() => handleNumberClick(0)}
          >
            0
          </button>
          <button
            className="bg-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-gray-100 transition-colors border-2 border-blue-100"
            onClick={() => handleOperatorClick(".")}
          >
            .
          </button>
          <button
            className="bg-green-500 text-white rounded-lg p-4 text-center font-bold text-xl shadow-md hover:bg-green-600 transition-colors"
            onClick={handleEquals}
          >
            =
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleScan}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <Scan className="h-5 w-5" />
          <span>סריקה</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>איפוס</span>
        </button>
      </div>
    </>
  )
}
