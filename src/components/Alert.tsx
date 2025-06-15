import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "error" | "warning" | "success" | "info";
}

export default function Alert({ isOpen, onClose, title, message, type }: AlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-500 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-500 text-yellow-800";
      case "success":
        return "bg-green-50 border-green-500 text-green-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-500 text-blue-800";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md"
        >
          <div className={`border-r-4 p-4 rounded shadow-lg rtl ${getAlertStyles()}`}>
            <div className="flex justify-between items-start">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
              <div className="flex-1 text-right">
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}