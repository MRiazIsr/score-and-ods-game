'use client';

import React from 'react';

interface MatchScoreInputProps {
  homeScore: number;
  awayScore: number;
  onHomeScoreChange: (value: number) => void;
  onAwayScoreChange: (value: number) => void;
}

export const MatchScoreInput: React.FC<MatchScoreInputProps> = ({
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange
}) => {
  const increaseScore = (currentScore: number, onChange: (value: number) => void) => {
    onChange(Math.min(99, currentScore + 1));
  };

  const decreaseScore = (currentScore: number, onChange: (value: number) => void) => {
    onChange(Math.max(0, currentScore - 1));
  };

  return (
    <div className="flex items-center justify-center space-x-8">
      {/* Home Score Input */}
      <div className="w-16 h-[100px] relative">
        <button 
          onClick={() => increaseScore(homeScore, onHomeScoreChange)}
          className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-t-lg flex items-center justify-center text-white transition-colors absolute top-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="12" y1="5" x2="12" y2="19"></line>
          </svg>
        </button>

        <input
          type="text"
          min="0"
          value={homeScore}
          onChange={(e) => onHomeScoreChange(Number(e.target.value))}
          className="w-full h-16 text-3xl font-bold text-center bg-gray-800 border-2 border-gray-700 border-t-0 border-b-0 text-white appearance-none overflow-hidden absolute top-[18px]"
          style={{ MozAppearance: 'textfield', paddingLeft: 0, paddingRight: 0, borderRadius: 0 }}
        />

        <button 
          onClick={() => decreaseScore(homeScore, onHomeScoreChange)}
          className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-b-lg flex items-center justify-center text-white transition-colors absolute top-[82px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="text-white text-2xl font-bold">:</div>

      {/* Away Score Input */}
      <div className="w-16 h-[100px] relative">
        <button 
          onClick={() => increaseScore(awayScore, onAwayScoreChange)}
          className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-t-lg flex items-center justify-center text-white transition-colors absolute top-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <line x1="12" y1="5" x2="12" y2="19"></line>
          </svg>
        </button>

        <input
          type="text"
          min="0"
          value={awayScore}
          onChange={(e) => onAwayScoreChange(Number(e.target.value))}
          className="w-full h-16 text-3xl font-bold text-center bg-gray-800 border-2 border-gray-700 border-t-0 border-b-0 text-white appearance-none overflow-hidden absolute top-[18px]"
          style={{ MozAppearance: 'textfield', paddingLeft: 0, paddingRight: 0, borderRadius: 0 }}
        />

        <button 
          onClick={() => decreaseScore(awayScore, onAwayScoreChange)}
          className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-b-lg flex items-center justify-center text-white transition-colors absolute top-[82px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
