import React, { useState, useRef, useEffect } from "react";

export const SubjectSelect: React.FC<{
  subjects: string[];
  selectedSubjects: string[];
  onChange: (newSubjects: string[]) => void;
}> = ({ subjects, selectedSubjects, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSubject = (subject: string) => {
    const updated = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    onChange(updated);
  };

  return (
    <div className="multi-select-wrapper" ref={wrapperRef}>
      <div className="fun-select" onClick={() => setIsOpen(!isOpen)}>
        {selectedSubjects.length > 0
          ? selectedSubjects.join(", ")
          : "בחר נושאים 📚"}
      </div>
      {isOpen && (
        <div className="multi-select-dropdown">
          {subjects.map((subject) => (
            <label key={subject} className="checkbox-option">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject)}
                onChange={() => toggleSubject(subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};