"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Input } from "@/app/client/components/ui/Input";
import { useState } from "react";

export function PasswordInput({
    value,
    error,
    label,
}: {
    value?: string;
    error?: string;
    label?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                value={value || ""}
                placeHolder="••••••••"
                label={label}
                error={error}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                    position: "absolute",
                    right: 10,
                    top: label ? 30 : 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    background: "transparent",
                    border: "none",
                    color: "#4A5148",
                    cursor: "pointer",
                }}
            >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
        </div>
    );
}
