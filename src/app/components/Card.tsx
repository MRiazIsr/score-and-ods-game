import { montserrat } from "@/app/ui/fonts";
import "../globals.css";
import React from "react";

export const Card = ({ title, description, children } : { title: string, description: string, children?: React.ReactNode }) => {
    return (
       <div className={`${montserrat.className} w-1/3 rounded-lg overflow-hidden shadow-xl bg-[var(--card-background)]`}>
           <div className="px-6 py-4 flex flex-col text-center space-y-2">
               <h2 className="text-2xl font-bold text-gray-400">{title}</h2>
               <p className="text-gray-400 text-base">{description}</p>
               {children}
           </div>
       </div>
    )
}