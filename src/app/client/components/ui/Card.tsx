import { montserrat } from "@/app/client/fonts/fonts";
import "../../../globals.css";
import React, { useState } from "react";
import { CardProps } from "@/app/client/components/types";

export const Card = ({ title, description, children, pointer, variant = 'default', width }: CardProps) => {
    const [hovered, setHovered] = useState(false);

    // Определяем ширину в зависимости от варианта
    const getCardWidth = () => {
        if (width) return width;
        switch (variant) {
            case 'form':
                return 'w-full max-w-lg';
            case 'competition':
                return 'w-1/4';
            default:
                return 'w-auto';
        }
    };

    // Определяем структуру в зависимости от варианта
    const isCompetitionCard = variant === 'competition';
    const isFormCard = variant === 'form';

    return (
        <div
            className={`${montserrat.className} ${getCardWidth()} rounded-lg overflow-hidden shadow-xl bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 transition-transform duration-300 ease-in-out transform ${
                hovered ? "scale-105 shadow-2xl" : "scale-100"
            } ${pointer ? "cursor-pointer" : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {isCompetitionCard ? (
                // Структура для карточек соревнований
                <div className="flex flex-col h-full min-h-[280px]">
                    <div className="px-0 pt-0">
                        {children}
                    </div>
                    <div className="px-6 py-2 flex flex-col text-center">
                        <h2 className="text-xl font-bold text-white transition-colors duration-300">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-gray-400 text-sm leading-relaxed mt-2">{description}</p>
                        )}
                    </div>
                </div>
            ) : (
                // Структура для форм и обычных карточек
                <div className="px-6 py-6">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-extrabold text-white transition-colors duration-300 mb-2">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-gray-400 text-base leading-relaxed">{description}</p>
                        )}
                    </div>
                    <div className="space-y-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};