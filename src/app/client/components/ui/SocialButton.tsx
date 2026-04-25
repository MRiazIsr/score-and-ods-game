import type { ReactNode } from "react";

type Provider = "google" | "telegram";

interface SocialButtonProps {
    provider: Provider;
    href: string;
    label: string;
    disabled?: boolean;
    title?: string;
}

const ICONS: Record<Provider, ReactNode> = {
    google: (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.591.102-1.166.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
            />
            <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
            />
        </svg>
    ),
    telegram: (
        <svg width="18" height="18" viewBox="0 0 240 240" aria-hidden="true">
            <defs>
                <linearGradient id="telegram-gradient" x1=".667" x2=".417" y1=".167" y2=".75">
                    <stop offset="0" stopColor="#37AEE2" />
                    <stop offset="1" stopColor="#1E96C8" />
                </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="120" fill="url(#telegram-gradient)" />
            <path
                fill="#fff"
                d="M53.5 116.3l141.4-54.5c6.6-2.4 12.3 1.6 10.2 11.6l.1-.1-24.1 113.5c-1.8 8.1-6.6 10.1-13.4 6.3l-37-27.3-17.9 17.2c-2 2-3.6 3.6-7.4 3.6l2.6-37.8 68.7-62.1c3-2.6-.7-4.1-4.6-1.5l-85 53.5-36.6-11.4c-7.9-2.5-8.1-7.9 1.7-11.7z"
            />
        </svg>
    ),
};

export function SocialButton({
    provider,
    href,
    label,
    disabled = false,
    title,
}: SocialButtonProps) {
    const baseStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        background: "#fff",
        border: "1.5px solid #E4E1D6",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        color: "#0B0F0A",
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        fontFamily: "inherit",
    };

    if (disabled) {
        return (
            <button type="button" disabled style={baseStyle} title={title}>
                {ICONS[provider]}
                <span>{label}</span>
            </button>
        );
    }

    return (
        <a href={href} style={baseStyle} title={title}>
            {ICONS[provider]}
            <span>{label}</span>
        </a>
    );
}
