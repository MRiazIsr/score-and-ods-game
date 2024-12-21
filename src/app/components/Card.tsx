import { montserrat } from "@/app/ui/fonts";
import "../globals.css";
import React from "react";

export const Card = ({ title, description, children } : { title: string, description: string, children?: React.ReactNode }) => {
    return (
       <div className={`${montserrat.className} max-w-sm rounded-lg overflow-hidden shadow-xl bg-[var(--card-background)]`}>
           <div className="px-6 py-4">
               <h2 className="text-2xl font-bold text-white">{title}</h2>
               <p className="text-gray-300 text-base">{description}</p>
               {children}
           </div>
       </div>
    )
}