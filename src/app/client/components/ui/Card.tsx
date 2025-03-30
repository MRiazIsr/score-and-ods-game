import { montserrat } from "@/app/client/fonts/fonts";
import "../../../globals.css";
import React, { useState } from "react";
import { CardProps } from "@/app/client/components/types";

export const Card = ({ title, description, children }: CardProps) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={`${montserrat.className} w-1/4 rounded-lg overflow-hidden shadow-xl bg-gradient-to-b from-gray-800 to-gray-900 transition-transform duration-300 ease-in-out transform ${
                hovered ? "scale-105 shadow-2xl" : "scale-100"
            }`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="px-6 py-4 flex flex-col text-center space-y-4">
                <h2 className="text-3xl font-extrabold text-white transition-colors duration-300">
                    {title}
                </h2>
                <p className="text-gray-400 text-base leading-relaxed">{description}</p>
                <div className="p-4 rounded-lg shadow-inner transition-all duration-300">
                    {children}
                </div>
            </div>
        </div>
    );
};
