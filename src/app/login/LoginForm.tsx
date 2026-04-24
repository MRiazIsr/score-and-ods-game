"use client";

import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";
import { AuthShell } from "@/app/client/components/stadium/AuthShell";
import Link from "next/link";
import Form from "next/form";
import { useActionState, useState } from "react";
import { signIn } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";

export default function LoginForm() {
    const [state, action, pending] = useActionState(signIn, undefined);
    const [, setErrors] = useState({});

    return (
        <AuthShell
            eyebrow="Welcome back"
            headline={{ blue: "Good to", italic: "see you." }}
            sub="Sign in to check your picks, climb your league, and settle this week's trash talk."
            footer={
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <Link href="/forgot-password" className="text-ink2 hover:text-ink" style={{ fontWeight: 500 }}>
                        Forgot password?
                    </Link>
                    <span className="text-ink2">
                        New here?{" "}
                        <Link href="/signup" style={{ color: "#9D0010", fontWeight: 700 }}>
                            Create account
                        </Link>
                    </span>
                </div>
            }
        >
            <ErrorNotification error={state?.message} onClose={() => setErrors({})} />

            <Form action={action}>
                <Input
                    name={FormFieldsKeysEntity.signInGroup.USERNAME}
                    id="userName"
                    type="text"
                    label="Username"
                    placeHolder="your-handle"
                    error={state?.errors?.userName}
                />

                <PasswordInput label="Password" value="" />

                {!state?.success && state?.message && (
                    <p style={{ color: "#9D0010", fontSize: 12, marginTop: -4, marginBottom: 12 }}>{state.message}</p>
                )}

                <label
                    className="flex items-center gap-2 text-ink2"
                    style={{ fontSize: 12, marginBottom: 18 }}
                >
                    <input type="checkbox" defaultChecked style={{ accentColor: "#1E3A8A" }} />
                    <span>Keep me signed in on this device</span>
                </label>

                <SubmitButton buttonText="Sign in" pending={pending} />
            </Form>

            {/* social row placeholder — visually mirrors the design */}
            <div className="flex items-center gap-3" style={{ marginTop: 20 }}>
                <span style={{ height: 1, flex: 1, background: "#E4E1D6" }} />
                <span className="uppercase text-ink2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6 }}>
                    or continue with
                </span>
                <span style={{ height: 1, flex: 1, background: "#E4E1D6" }} />
            </div>
            <div className="grid grid-cols-3 gap-2" style={{ marginTop: 12 }}>
                {["Google", "Apple", "Telegram"].map((p) => (
                    <button
                        key={p}
                        type="button"
                        style={{
                            padding: "10px 12px",
                            background: "#fff",
                            border: "1.5px solid #E4E1D6",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#0B0F0A",
                            cursor: "pointer",
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </AuthShell>
    );
}
