import {InputProps} from "@/app/components/types";

export function Input({
                          label,
                          name,
                          type = 'text',
                          value,
                          placeHolder,
                          onChange,
                          error,
                          required = false
                      }: InputProps) {
    // Generate a unique ID for accessibility
    const inputId = `${name}-input`;

    return (
        <div className="mb-4">
            {/* Properly associated label with input */}
            <label
                htmlFor={inputId}
                className="block text-sm font-medium text-gray-200 mb-1"
            >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                id={inputId}
                type={type}
                name={name}
                value={value}
                placeholder={placeHolder}
                onChange={onChange}
                required={required}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={`
                    w-full 
                    px-4 
                    py-2 
                    rounded-lg 
                    bg-[var(--input-background)]
                    text-gray-200
                 
                    placeholder:text-gray-500
                  
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:border-transparent
                  
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  
                    transition-colors
                    duration-200
                `}
            />

            {/* Error message with proper ARIA association */}
            {error && (
                <p
                    id={`${inputId}-error`}
                    className="mt-2 text-sm text-red-500"
                >
                    {error}
                </p>
            )}
        </div>
    );
}