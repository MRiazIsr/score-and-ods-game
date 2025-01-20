// components/ui/error-notification.tsx
'use client';
import { XCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ErrorNotificationProps {
    error: string | null;
    title?: string;
    onClose?: () => void;
}

export function ErrorNotification({
                                      error,
                                      title = "Error",
                                      onClose
                                  }: ErrorNotificationProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (error) {
            setShow(true);
        }
    }, [error]);

    const handleClose = () => {
        setShow(false);
        onClose?.();
    };

    if (!error || !show) return null;

    return (
        <div
            className={`
                bg-red-50 
                border-l-4 
                border-red-500 
                p-4 
                rounded-md 
                shadow-sm 
                relative
                animate-in 
                slide-in-from-top 
                duration-300
            `}
        >
            <div className="flex items-center gap-3 pr-8">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                    <h3 className="text-sm font-medium text-red-800">
                        {title}
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                        {error}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}