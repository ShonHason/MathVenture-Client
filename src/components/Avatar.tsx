export default function Avatar() {
    return (
      <div className="relative mb-6">
        {/* Yellow thought bubbles */}
        <div className="absolute -top-4 -left-4 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute -top-6 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
  
        {/* Robot character */}
        <div className="w-40 h-40 relative">
          <div className="absolute inset-0 bg-yellow-400 rounded-3xl"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-12 bg-gray-800 rounded-full opacity-30"></div>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-8 bg-gray-900 rounded-full"></div>
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-16 h-2 bg-gray-500 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 left-4 w-8 h-12 bg-gray-500 rounded-b-xl"></div>
          <div className="absolute bottom-4 right-4 w-8 h-12 bg-gray-500 rounded-b-xl"></div>
          <div className="absolute -left-4 top-1/2 w-10 h-16 bg-yellow-400 rounded-l-full"></div>
          <div className="absolute -right-4 top-1/2 w-10 h-16 bg-yellow-400 rounded-r-full"></div>
        </div>
      </div>
    )
  }
  