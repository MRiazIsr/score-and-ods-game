'use client';  // Add this at the very top of the file
import { ButtonProps } from "@/app/client/components/types";

export const SubmitButton = ({ buttonText, pending }: ButtonProps) => {

    return (
        <button
            className={`
                bg-blue-800 
                text-gray-300 
                font-semibold 
                px-6 
                py-3 
                rounded-lg
                border-2
                border-transparent
                
                hover:bg-blue-900
                hover:scale-105
                active:scale-95
                
                transition-all 
                duration-200 
                ease-in-out
                
                disabled:opacity-50 
                disabled:cursor-not-allowed
                disabled:hover:scale-100
                
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-700 
                focus:ring-offset-2
                
                min-w-[120px]
                relative
            `}
            disabled={pending}
        >
            <span className={`
                flex 
                items-center 
                justify-center 
                gap-2
                ${pending ? 'opacity-0' : 'opacity-100'}
            `}>
                {buttonText}
            </span>

            {pending && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-gray-300" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </span>
            )}
        </button>
    );
};