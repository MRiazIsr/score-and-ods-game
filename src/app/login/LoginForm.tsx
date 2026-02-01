'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import Link from "next/link";
import Form from "next/form";
import { useActionState, useState } from 'react';
import { signIn } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginForm() {
    const [state, action, pending] = useActionState(signIn, undefined);
    const [errors, setErrors] = useState({});

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">TJ Score Game</CardTitle>
                <CardDescription className="text-center">Please Log In</CardDescription>
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
                        <Label htmlFor="userName">Username</Label>
                        <Input
                            name={FormFieldsKeysEntity.signInGroup.USERNAME}
                            id='userName'
                            type='text'
                            placeholder='MyFunnyUserName'
                            className={state?.errors?.userName ? "border-destructive" : ""}
                        />
                        {state?.errors?.userName && (
                             <p className="text-sm text-destructive">{state.errors.userName}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            name="password"
                            id="password"
                            placeholder="********"
                            // error={state?.errors?.password?.[0]}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                 <Link href="/signup" className="hover:text-primary transition-colors">Sign Up</Link>
                 <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                 <Link href="/forgot-password" className="hover:text-primary transition-colors">Forgot Password</Link>
                 <Link href="/contact-us" className="hover:text-primary transition-colors">Contact Us</Link>
            </CardFooter>
        </Card>
    );
}