'use client';
import {XCircle, X} from 'lucide-react';
import {useState, useEffect} from 'react';

interface ErrorNotificationProps {
    error: string | undefined;
    title?: string;
    onClose?: () => void;
    duration?: number;
}

export function ErrorNotification({
                                      error,
                                      title = "Error",
                                      duration = 5000,
                                  }: ErrorNotificationProps) {
    const [show, setShow] = useState(false);
    console.log(error);
    useEffect(() => {
        if (error) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [error, duration]);

    const handleClose = () => {
        setShow(false);
    };

    if (!error || !show) return null;

    return (
        <div
            className={`
                bg-red-600 
                border-l-4 
                border-red-800 
                p-2 
                w-full
                rounded-md 
                shadow-md 
                relative
                animate-in 
                slide-in-from-top 
                duration-300
                transition-all
                hover:shadow-xl
                text-left
            `}
        >
            <div className="flex items-center gap-3 pr-8">
                <XCircle className="h-5 w-5 text-red-200 flex-shrink-0"/>
                <div>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                    <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:text-red-300"
            >
                <X className="h-4 w-4"/>
            </button>
        </div>
    );
}

