
'use client';

import React from 'react';

interface MatchScoreInputProps {
  homeScore: number;
  awayScore: number;
  onHomeScoreChange: (value: number) => void;
  onAwayScoreChange: (value: number) => void;
  disabled?: boolean;
}

export const MatchScoreInput: React.FC<MatchScoreInputProps> = ({
                                                                  homeScore,
                                                                  awayScore,
                                                                  onHomeScoreChange,
                                                                  onAwayScoreChange,
                                                                  disabled = false
                                                                }) => {
  const increaseScore = (currentScore: number, onChange: (value: number) => void) => {
    if (!disabled) {
      onChange(Math.min(99, currentScore + 1));
    }
  };

  const decreaseScore = (currentScore: number, onChange: (value: number) => void) => {
    if (!disabled) {
      onChange(Math.max(0, currentScore - 1));
    }
  };

  const handleInputChange = (value: string, onChange: (value: number) => void) => {
    if (!disabled) {
      onChange(Number(value));
    }
  };

  return (
      <div className="flex items-center justify-center space-x-8">
        {/* Home Score Input */}
        <div className="w-16 h-[100px] relative">
          {!disabled && (
              <button
                  onClick={() => increaseScore(homeScore, onHomeScoreChange)}
                  className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-t-lg flex items-center justify-center text-white transition-colors absolute top-0"
              >
                +
              </button>
          )}

          <input
              type="text"
              min="0"
              value={homeScore}
              onChange={(e) => handleInputChange(e.target.value, onHomeScoreChange)}
              disabled={disabled}
              className={`w-full h-16 text-3xl font-bold text-center border-2 border-gray-700 text-white appearance-none overflow-hidden absolute ${
                  disabled
                      ? 'bg-gray-600 cursor-not-allowed top-[18px] rounded-lg border-0'
                      : 'bg-gray-800 border-t-0 border-b-0 top-[18px]'
              }`}
              style={{ MozAppearance: 'textfield', paddingLeft: 0, paddingRight: 0, borderRadius: disabled ? '0.5rem' : 0 }}
          />

          {!disabled && (
              <button
                  onClick={() => decreaseScore(homeScore, onHomeScoreChange)}
                  className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-b-lg flex items-center justify-center text-white transition-colors absolute top-[82px]"
              >
                -
              </button>
          )}
        </div>

        <div className="text-white text-2xl font-bold">:</div>

        {/* Away Score Input */}
        <div className="w-16 h-[100px] relative">
          {!disabled && (
              <button
                  onClick={() => increaseScore(awayScore, onAwayScoreChange)}
                  className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-t-lg flex items-center justify-center text-white transition-colors absolute top-0"
              >
                +
              </button>
          )}

          <input
              type="text"
              min="0"
              value={awayScore}
              onChange={(e) => handleInputChange(e.target.value, onAwayScoreChange)}
              disabled={disabled}
              className={`w-full h-16 text-3xl font-bold text-center border-2 border-gray-700 text-white appearance-none overflow-hidden absolute ${
                  disabled
                      ? 'bg-gray-600 cursor-not-allowed top-[18px] rounded-lg border-0'
                      : 'bg-gray-800 border-t-0 border-b-0 top-[18px]'
              }`}
              style={{ MozAppearance: 'textfield', paddingLeft: 0, paddingRight: 0, borderRadius: disabled ? '0.5rem' : 0 }}
          />

          {!disabled && (
              <button
                  onClick={() => decreaseScore(awayScore, onAwayScoreChange)}
                  className="w-full h-[18px] bg-gray-700 hover:bg-gray-600 rounded-b-lg flex items-center justify-center text-white transition-colors absolute top-[82px]"
              >
                -
              </button>
          )}
        </div>
      </div>
  );
};