import React from 'react';
import './Transcript.css';

interface TranscriptProps {
  text: string;
  isLoading?: boolean;
}

const Transcript: React.FC<TranscriptProps> = ({ text, isLoading = false }) => {
  return (
    <div className={`transcript ${isLoading ? 'loading' : ''}`}>
      {text}
    </div>
  );
};

export default Transcript;