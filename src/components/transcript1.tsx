interface Message {
    sender: "bot" | "user"
    text: string
  }
  
  interface TranscriptProps {
    messages: Message[]
  }
  
  export default function Transcript1({ messages }: TranscriptProps) {
    return (
      <div className="w-full bg-gray-50 rounded-2xl p-3 h-48 overflow-y-auto">
        <h3 className="text-gray-700 font-bold mb-2 text-right">תמליל שיחה</h3>
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg max-w-[85%] ${
                message.sender === "bot"
                  ? "bg-brand-mint/30 text-right self-start"
                  : "bg-brand-yellow/30 text-right self-end"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  