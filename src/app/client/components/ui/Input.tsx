"use client";

import { InputProps } from "@/app/client/components/types";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function Input({
    label,
    name,
    id,
    type = "text",
    value,
    placeHolder,
    onChange,
    onBlur,
    error,
    hint,
    success,
    validating,
    required = false,
    autoComplete,
}: InputProps) {
    const [focused, setFocused] = useState(false);
    const t = useTranslations("form");
    const inputId = id || `${name}-input`;
    const errorText = Array.isArray(error) ? error[0] : error;

    const borderColor = errorText
        ? "#9D0010"
        : success && !validating
            ? "#15803D"
            : focused
                ? "#1E3A8A"
                : "#E4E1D6";

    return (
        <div style={{ marginBottom: 14 }}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="uppercase"
                    style={{
                        display: "block",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: focused ? "#1E3A8A" : "#4A5148",
                        marginBottom: 6,
                    }}
                >
                    {label}
                    {required && <span style={{ color: "#9D0010", marginLeft: 2 }}>*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    defaultValue={value}
                    placeholder={placeHolder}
                    onChange={onChange}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    required={required}
                    autoComplete={autoComplete}
                    onFocus={() => setFocused(true)}
                    aria-invalid={!!errorText}
                    aria-describedby={
                        errorText ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
                    }
                    style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#FFFFFF",
                        color: "#0B0F0A",
                        fontSize: 14,
                        fontFamily: "inherit",
                        border: `1.5px solid ${borderColor}`,
                        borderRadius: 6,
                        outline: "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        boxShadow: focused ? "0 0 0 3px rgba(30,58,138,0.12)" : "none",
                    }}
                />
                {validating && (
                    <p style={{ marginTop: 6, fontSize: 12, color: "#4A5148" }}>
                        {t("validating")}
                    </p>
                )}
                {!validating && errorText && (
                    <p id={`${inputId}-error`} style={{ marginTop: 6, fontSize: 12, color: "#9D0010" }}>
                        {errorText}
                    </p>
                )}
                {!validating && !errorText && success && (
                    <p style={{ marginTop: 6, fontSize: 12, color: "#15803D" }}>
                        {success}
                    </p>
                )}
                {!validating && !errorText && !success && hint && (
                    <p
                        id={`${inputId}-hint`}
                        style={{ marginTop: 6, fontSize: 12, color: "#4A5148", lineHeight: 1.4 }}
                    >
                        {hint}
                    </p>
                )}
            </div>
        </div>
    );
}
