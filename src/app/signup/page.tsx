'use client';
import { Card } from "@/app/client/components/ui/Card";
import { SubmitButton } from "@/app/client/components/ui/SubmitButton"
//import { ErrorNotification } from '@/app/components/ui/ErrorNotice'
import { Input } from "@/app/client/components/ui/Input";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from 'react'
import { signup } from "@/app/actions/auth";



export default function SignUpPage() {
    const [state, action, pending] = useActionState(signup, undefined);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-950 from-10% via-violet-950 via-30% to-emerald-950 to-90%">
            <Card
                title="TJ Score Game"
                description="Please Register Your Account "
            >
                <Form action={action}>
                    <Input name={'name'} id={'name'} type={'name'} value={''} placeHolder={'Anton'}/>
                    {state?.errors?.name && <p>{state.errors.name}</p>}

                    <Input name={'email'} id={'email'} type={'email'} value={''} placeHolder={'email@example.com'}/>
                    {state?.errors?.email && <p>{state.errors.email}</p>}

                    <Input name={'userName'} id={'userName'} type={'userName'} value={''} placeHolder={'tj'}/>
                    {state?.errors?.userName && <p className="text-red-500">{state.errors.userName}</p>}

                    <Input name={'password'} id={'password'} type={'password'} value={''} placeHolder={'********'}/>
                    {state?.errors?.password && (
                        <div>
                            <ul>
                                {state.errors.password.map((error) => {
                                    const text: string = error === 'Required' ? 'Password' : 'Password Must'
                                    return <li className="text-red-500" key={error}>{text} - {error}</li>
                                })}
                            </ul>
                        </div>
                    )}
                    <div className="space-x-2">
                        <SubmitButton buttonText="Sign Up" pending={pending}/>
                    </div>
                </Form>
                <div className={'flex flex-row space-x-2 justify-center'}>
                    <Link
                        href="/login"
                        className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                        aria-label="Navigate to About page"
                    >
                        Sign In
                    </Link>
                </div>
            </Card>
      </main>
  );
}
