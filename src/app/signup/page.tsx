
'use client';

import { Card } from "@/app/client/components/ui/Card";
import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import Link from "next/link";
import Form from "next/form";
import {useActionState, useRef, useState} from 'react';
import { signUp } from "@/app/actions/auth";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import { redirect } from "next/navigation";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";

export default function SignUpPage() {
    const [state, action, pending] = useActionState(signUp, undefined);
    // if (state?.success) {
    //     redirect('/')
    // }

    const signUpFormValues = state?.values || {};

    return (
        <Card
            title="TJ Score Game"
            description="Please Register Your Account"
            variant="form"
        >
            {!state?.success && (
                <ErrorNotification
                    key={`${state?.message}-${Date.now()}`}
                    error={state?.message}
                />
            )}
            <Form action={action} className="space-y-4">
                {/* Name Input */}
                <Input
                    name={'name'}
                    id={FormFieldsKeysEntity.signUpGroup.NAME}
                    type={'text'}
                    value={signUpFormValues.name}
                    placeHolder={'Anton'}
                />
                {state?.errors?.name && <p className="text-red-500">{state.errors.name}</p>}

                {/* Email Input */}
                <Input
                    name={'email'}
                    id={'email'}
                    type={'email'}
                    value={signUpFormValues.email}
                    placeHolder={'email@example.com'}
                />
                {state?.errors?.email && <p className="text-red-500">{state.errors.email}</p>}

                {/* Username Input */}
                <Input
                    name={'userName'}
                    id={'userName'}
                    type={'text'}
                    value={signUpFormValues.userName}
                    placeHolder={'tj'}
                />
                {state?.errors?.userName && <p className="text-red-500">{state.errors.userName}</p>}

                {/* Password Input */}
                <PasswordInput
                    value={signUpFormValues.password}
                    error={state?.errors?.password?.[0]}
                />
                {state?.errors?.password && (
                    <div className="space-y-1">
                        <ul className="list-disc pl-5 space-y-1 text-red-500">
                            {state.errors.password.map((error) => {
                                const text: string = error === 'Required' ? 'Password' : 'Password Required';
                                return (
                                    <li key={error}>
                                        {text} - {error}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                    <SubmitButton buttonText="Sign Up" pending={pending} />
                </div>
            </Form>

            {/* Sign In Link */}
            <div className="flex flex-row space-x-2 justify-center pt-4">
                <Link
                    href="/login"
                    className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                    aria-label="Navigate to Login page"
                >
                    Already have an account? Sign In
                </Link>
            </div>
        </Card>
    );
}