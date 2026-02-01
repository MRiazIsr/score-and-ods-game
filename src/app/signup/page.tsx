
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from 'react';
import { signUp } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import { Loader2, AlertCircle } from "lucide-react";

export default function SignUpPage() {
    const [state, action, pending] = useActionState(signUp, undefined);
    const signUpFormValues = state?.values || {};

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">TJ Score Game</CardTitle>
                <CardDescription className="text-center">Please Register Your Account</CardDescription>
            </CardHeader>
            <CardContent>
                {state?.message && !state?.success && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}

                <Form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={FormFieldsKeysEntity.signUpGroup.NAME}>Name</Label>
                        <Input
                            name='name'
                            id={FormFieldsKeysEntity.signUpGroup.NAME}
                            type='text'
                            defaultValue={signUpFormValues.name}
                            placeholder='Anton'
                            className={state?.errors?.name ? "border-destructive" : ""}
                        />
                        {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            name='email'
                            id='email'
                            type='email'
                            defaultValue={signUpFormValues.email}
                            placeholder='email@example.com'
                            className={state?.errors?.email ? "border-destructive" : ""}
                        />
                        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="userName">Username</Label>
                        <Input
                            name='userName'
                            id='userName'
                            type='text'
                            defaultValue={signUpFormValues.userName}
                            placeholder='tj'
                            className={state?.errors?.userName ? "border-destructive" : ""}
                        />
                        {state?.errors?.userName && <p className="text-sm text-destructive">{state.errors.userName}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            name="password"
                            id="password"
                            defaultValue={signUpFormValues.password}
                            // error={state?.errors?.password?.[0]}
                        />
                        {state?.errors?.password && (
                            <div className="text-sm text-destructive">
                                <ul className="list-disc pl-5">
                                    {state.errors.password.map((error: string) => (
                                        <li key={error}>
                                            {error === 'Required' ? 'Password Required' : error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing Up...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </Button>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                 <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                     Already have an account? Sign In
                 </Link>
            </CardFooter>
        </Card>
    );
}