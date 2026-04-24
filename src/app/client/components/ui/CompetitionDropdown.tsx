"use client";

import { Competition } from "@/app/server/modules/competitions/types";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface CompetitionDropdownProps {
    competitions: Competition[];
    selectedCompetitionId: number;
    onSelect: (competitionId: number) => void;
}

export function CompetitionDropdown({
    competitions,
    selectedCompetitionId,
    onSelect,
}: CompetitionDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const flatCompetitions = competitions.flat();
    const selected = flatCompetitions.find((c) => c.id === selectedCompetitionId);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px 8px 8px",
                    background: "#fff",
                    border: "1.5px solid #E4E1D6",
                    borderRadius: 6,
                    color: "#0B0F0A",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                }}
            >
                {selected && (
                    <span className="flex items-center gap-2">
                        <span
                            style={{
                                background: "#F4F2EC",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Image src={selected.emblem} alt={selected.name} width={20} height={20} className="object-contain" />
                        </span>
                        <span>{selected.name}</span>
                    </span>
                )}
                <svg
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        right: 0,
                        minWidth: 220,
                        background: "#fff",
                        border: "1px solid #E4E1D6",
                        borderRadius: 8,
                        boxShadow: "0 12px 32px rgba(15,25,15,0.10)",
                        zIndex: 50,
                        overflow: "hidden",
                    }}
                >
                    {flatCompetitions.map((c) => {
                        const active = c.id === selectedCompetitionId;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                    onSelect(c.id);
                                    setIsOpen(false);
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    width: "100%",
                                    padding: "10px 14px",
                                    background: active ? "#E0E7FF" : "transparent",
                                    color: active ? "#1E3A8A" : "#0B0F0A",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                }}
                            >
                                <span
                                    style={{
                                        background: "#F4F2EC",
                                        borderRadius: "50%",
                                        width: 24,
                                        height: 24,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image src={c.emblem} alt={c.name} width={16} height={16} className="object-contain" />
                                </span>
                                <span>{c.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
