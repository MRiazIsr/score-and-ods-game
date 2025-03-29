'use client';
import { Card } from "@/app/client/components/ui/Card";
import { SubmitButton } from "@/app/client/components/ui/SubmitButton"
import { Input } from "@/app/client/components/ui/Input";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from 'react'
import { signIn } from "@/app/actions/auth";
import { FormFieldsKeys } from "@/app/server/entities/FormFieldsKeys";

export default function LoginPage() {
    const [state, action, pending] = useActionState(signIn, undefined);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-950 from-10% via-violet-950 via-30% to-emerald-950 to-90%">
            <Card
                title="TJ Score Game"
                description="Please Log In "
            >
                <Form action={action}>
                    <Input name={FormFieldsKeys.signInGroup.USERNAME} id={'userName'} type={'userName'} value={''} placeHolder={'MyFunnyUserName'}/>
                    {state?.errors?.userName && <p className="text-red-500">{state.errors.userName}</p>}

                    <Input name={FormFieldsKeys.signInGroup.PASSWORD} id={'password'} type={'password'} value={''} placeHolder={'********'}/>
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
                    {!state?.success && state?.message && (
                        <div className='space-y-1'>
                            <p className="text-red-500"> { state.message } </p>
                        </div>
                    )}

                    <SubmitButton buttonText="Sign In" pending={pending}/>

                </Form>
                <div className={'flex flex-row space-x-2 justify-center'}>
                    <Link
                        href="/signup"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to About page"
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
