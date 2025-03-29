import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from "@/app/client/components/ui/Input";
import { useState } from 'react'

// In your component:
export function PasswordInput( { value }: {value?: string }) {
    const [showPassword, setShowPassword] = useState(false);

    return <div className="relative">
        <Input
            name={'password'}
            id={'password'}
            type={showPassword ? 'text' : 'password'}
            value={value || ''}
            placeHolder={'********'}
        />
        <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400"/>
            ) : (
                <EyeIcon className="h-5 w-5 text-gray-400"/>
            )}
        </button>
    </div>
}
