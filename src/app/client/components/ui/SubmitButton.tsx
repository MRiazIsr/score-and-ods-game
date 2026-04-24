"use client";

import { ButtonProps } from "@/app/client/components/types";

export const SubmitButton = ({ buttonText, pending }: ButtonProps) => {
    return (
        <button
            type="submit"
            disabled={pending}
            className="uppercase"
            style={{
                width: "100%",
                padding: "14px 20px",
                background: pending ? "#4A5148" : "#9D0010",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 0.5,
                cursor: pending ? "not-allowed" : "pointer",
                position: "relative",
                transition: "background 0.15s, transform 0.15s",
                fontFamily: "inherit",
            }}
        >
            <span style={{ opacity: pending ? 0 : 1 }}>{buttonText}</span>
            {pending && (
                <span
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            opacity="0.25"
                        />
                        <path
                            fill="currentColor"
                            opacity="0.75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </span>
            )}
        </button>
    );
};
