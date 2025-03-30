import { InputProps } from "@/app/client/components/types";
import { useState } from 'react';

export function Input({
                          label,
                          name,
                          type = "text",
                          value,
                          placeHolder,
                          onChange,
                          error,
                          required = false,
                      }: InputProps) {
    const [focused, setFocused] = useState(false);
    const inputId = `${name}-input`;

    return (
        <div className="mb-4 transition-all duration-300">
            <label
                htmlFor={inputId}
                className={`block text-sm font-medium mb-1 transition-all ${
                    focused ? "text-blue-400" : "text-gray-300"
                }`}
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    defaultValue={value}
                    placeholder={placeHolder}
                    onChange={onChange}
                    required={required}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    className={`
                        w-full 
                        px-4 
                        py-2 
                        rounded-lg 
                        bg-gray-800
                        text-white
                        placeholder:text-gray-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        focus:border-transparent
                        transition-all
                        duration-300
                    `}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-2 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

