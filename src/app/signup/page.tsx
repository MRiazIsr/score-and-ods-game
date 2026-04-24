"use client";

import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";
import { AuthShell } from "@/app/client/components/stadium/AuthShell";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from "react";
import { signUp } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";

export default function SignUpPage() {
    const [state, action, pending] = useActionState(signUp, undefined);
    const signUpFormValues = state?.values || {};

    return (
        <AuthShell
            eyebrow="Start a prediction league"
            headline={{ blue: "Start the", italic: "party." }}
            sub="30 seconds, one invite link. Your group, your league, your trash talk."
            footer={
                <div className="text-ink2" style={{ fontSize: 12, textAlign: "center" }}>
                    Already playing?{" "}
                    <Link href="/login" style={{ color: "#9D0010", fontWeight: 700 }}>
                        Sign in
                    </Link>
                </div>
            }
        >
            {!state?.success && (
                <ErrorNotification
                    key={`${state?.message}-${Date.now()}`}
                    error={state?.message}
                />
            )}

            <Form action={action}>
                <Input
                    name="name"
                    id={FormFieldsKeysEntity.signUpGroup.NAME}
                    type="text"
                    label="Name"
                    value={signUpFormValues.name}
                    placeHolder="Anton"
                    error={state?.errors?.name}
                />

                <Input
                    name="email"
                    id="email"
                    type="email"
                    label="Email"
                    value={signUpFormValues.email}
                    placeHolder="you@example.com"
                    error={state?.errors?.email}
                />

                <Input
                    name="userName"
                    id="userName"
                    type="text"
                    label="Handle"
                    value={signUpFormValues.userName}
                    placeHolder="tj"
                    error={state?.errors?.userName}
                />

                <PasswordInput
                    label="Password"
                    value={signUpFormValues.password}
                    error={state?.errors?.password?.[0]}
                />

                {state?.errors?.password && (
                    <ul style={{ margin: "6px 0 12px", paddingLeft: 18, color: "#9D0010", fontSize: 12 }}>
                        {state.errors.password.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}

                <label
                    className="flex items-start gap-2 text-ink2"
                    style={{ fontSize: 12, margin: "8px 0 18px" }}
                >
                    <input type="checkbox" defaultChecked style={{ accentColor: "#1E3A8A", marginTop: 2 }} />
                    <span>
                        I agree to the{" "}
                        <span style={{ textDecoration: "underline" }}>Terms</span> and{" "}
                        <span style={{ textDecoration: "underline" }}>Privacy</span>.
                    </span>
                </label>

                <SubmitButton buttonText="Create account" pending={pending} />
            </Form>
        </AuthShell>
    );
}
