"use client";

import { Competition } from "@/app/server/modules/competitions/types";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CompetitionDropdownProps {
  competitions: Competition[][];
  selectedCompetitionId: number;
  onSelect: (competitionId: number) => void;
}

export function CompetitionDropdown({
  competitions,
  selectedCompetitionId,
  onSelect
}: CompetitionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Flatten competitions array
  const flatCompetitions = competitions.flat();

  // Find selected competition
  const selectedCompetition = flatCompetitions.find(
    (comp) => comp.id === selectedCompetitionId
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        {selectedCompetition && (
          <div className="flex items-center space-x-2">
            <div className="bg-white rounded-full p-1 w-7 h-7 flex items-center justify-center">
              <Image 
                src={selectedCompetition.emblem} 
                alt={selectedCompetition.name} 
                width={20} 
                height={20} 
                className="object-contain"
              />
            </div>
            <span>{selectedCompetition.name}</span>
          </div>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {flatCompetitions.map((competition) => (
            <button
              key={competition.id}
              onClick={() => {
                onSelect(competition.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                competition.id === selectedCompetitionId
                  ? "bg-gray-700"
                  : ""
              }`}
            >
              <div className="bg-white rounded-full p-1 w-7 h-7 flex items-center justify-center">
                <Image 
                  src={competition.emblem} 
                  alt={competition.name} 
                  width={20} 
                  height={20} 
                  className="object-contain"
                />
              </div>
              <span className="text-white">{competition.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
