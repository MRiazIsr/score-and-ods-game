import React from "react";

export interface InputProps {
    name: string;
    id: string;
    type: string;
    value?: string;
    placeHolder: string;
    required?: boolean;
    label?: string;
    error?: string[] | string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    validation?: (value: string) => string;
}

export interface ButtonProps {
    buttonText: string,
    pending: boolean,
}

export interface CardProps {
    title: string,
    description: string,
    children?: React.ReactNode
}