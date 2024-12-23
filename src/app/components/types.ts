import React from "react";

export interface InputProps {
    name: string;
    id: string;
    type: string;
    value?: string;
    placeHolder: string;
    required?: boolean;
    label?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    validation?: (value: string) => string;
}