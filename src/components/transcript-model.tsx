import { X } from "lucide-react";

interface Message {
  sender: "bot" | "user";
  text: string;
}

interface TranscriptModalProps {
  messages: Message[];
  onClose: () => void;
}

export default function TranscriptModal({ messages, onClose }: TranscriptModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl relative">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">תמלול שיחה</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-72">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl max-w-[85%] ${
                  message.sender === "bot"
                    ? "bg-blue-100 text-right self-start border-2 border-blue-200"
                    : "bg-yellow-100 text-left self-end border-2 border-yellow-200"
                }`}
              >
                <p className="text-gray-800">{message.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
