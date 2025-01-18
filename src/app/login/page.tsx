'use client';
import { Card } from "@/app/components/ui/Card";
import { SubmitButton } from "@/app/components/ui/SubmitButton"
//import { ErrorNotification } from '@/app/components/ui/ErrorNotice'
import { Input } from "@/app/components/ui/Input";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from 'react'
import {signup} from "@/app/actions/auth";



export default function LoginPage() {
    const [state, action, pending] = useActionState(signup, undefined);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-950 from-10% via-violet-950 via-30% to-emerald-950 to-90%">
            <Card
                title="TIP MANAGER"
                description="Please Log In "
            >
                <Form action={action}>
                    <Input name={'email'} id={'email'} type={'email'} value={''} placeHolder={'email@example.com'}/>
                    {state?.errors?.email && <p>{state.errors.email}</p>}

                    <Input name={'password'} id={'password'} type={'password'} value={''} placeHolder={'********'}/>
                    {state?.errors?.password && (
                        <div>
                            <p>Password must:</p>
                            <ul>
                                {state.errors.password.map((error) => (
                                    <li key={error}>- {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <SubmitButton buttonText="Sign In" pending={pending}/>
                </Form>
                <div className={'flex flex-row space-x-2 justify-center'}>
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
