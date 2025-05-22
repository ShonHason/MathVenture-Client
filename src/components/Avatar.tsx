import React from "react";

export default function Avatar() {
  return (
    <div className="relative mb-6 w-48 h-48 flex items-center justify-center">
      
        {/*BUBBLE ANIMATIONS-->
      <div className="absolute -top-4 -left-4 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
      <div className="absolute -top-6 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce delay-150"></div>
        */}
      
      <img
        src="/MathVentureBot.svg"
        alt="Math Venture Bot"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
}
