import { montserrat } from "@/app/client/fonts/fonts";
import "../../../globals.css";
import React from "react";
import { CardProps } from "@/app/client/components/types";

export const Card = ({ title, description, children } : CardProps ) => {
    return (
       <div className={`${montserrat.className} w-1/4 rounded-lg overflow-hidden shadow-xl bg-[var(--card-background)]`}>
           <div className="px-6 py-4 flex flex-col text-center space-y-2">
               <h2 className="text-2xl font-bold text-gray-400">{title}</h2>
               <p className="text-gray-400 text-base">{description}</p>
               {children}
           </div>
       </div>
    )
}