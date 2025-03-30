import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from "@/app/client/components/ui/Input";
import { useState } from 'react'

export function PasswordInput({
                                  value,
                                  error,
                              }: {
    value?: string;
    error?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative group">
            <Input
                name={"password"}
                id={"password"}
                type={showPassword ? "text" : "password"}
                value={value || ""}
                placeHolder={"********"}
                error={error}
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
            >
                {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 transition-transform transform group-hover:scale-110" />
                ) : (
                    <EyeIcon className="h-5 w-5 transition-transform transform group-hover:scale-110" />
                )}
            </button>
        </div>
    );
}
