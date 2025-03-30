'use client';
import { Card } from "@/app/client/components/ui/Card";
import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";
import Link from "next/link";
import Form from "next/form";
import { useActionState, useState } from 'react';
import { signIn } from "@/app/actions/auth";
import { FormFieldsKeys } from "@/app/server/entities/FormFieldsKeys";

export default function LoginPage() {
    const [state, action, pending] = useActionState(signIn, undefined);
    const [errors, setErrors] = useState({});

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-950 via-violet-950 to-emerald-950">
            <Card
                title="TJ Score Game"
                description="Please Log In"
            >
                <ErrorNotification error={state?.message} onClose={() => setErrors({})} />

                <Form action={action} className="space-y-4">
                    <Input
                        name={FormFieldsKeys.signInGroup.USERNAME}
                        id='userName'
                        type='text'
                        placeHolder='MyFunnyUserName'
                        error={state?.errors?.userName}
                    />

                    <PasswordInput
                        value=''
                        // error={state?.errors?.password?.[0]}
                    />

                    {!state?.success && state?.message && (
                        <p className="text-red-500 text-sm">{state.message}</p>
                    )}

                    <SubmitButton buttonText="Sign In" pending={pending} />
                </Form>

                <div className='flex flex-row space-x-2 justify-center pt-4'>
                    <Link
                        href="/signup"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to Sign Up page"
                    >
                        Sign Up
                    </Link>
                    <Link
                        href="/about"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to About page"
                    >
                        About
                    </Link>
                    <Link
                        href="/forgot-password"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to Forgot Password page"
                    >
                        Forgot Password
                    </Link>
                    <Link
                        href="/contact-us"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to Contact Us page"
                    >
                        Contact Us
                    </Link>
                </div>
            </Card>
        </main>
    );
}
