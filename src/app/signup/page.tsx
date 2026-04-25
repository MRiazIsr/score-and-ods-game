"use client";

import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";
import { AuthShell } from "@/app/client/components/stadium/AuthShell";
import { SocialAuthBlock } from "@/app/client/components/ui/SocialAuthBlock";
import Link from "next/link";
import Form from "next/form";
import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signUp } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";

const USERNAME_REGEX = /^[a-z0-9_]+$/;

type AvailabilityState = "idle" | "checking" | "available" | "taken" | "format";

function useAvailability(field: "username" | "email", value: string): AvailabilityState {
    const [state, setState] = useState<AvailabilityState>("idle");
    const seq = useRef(0);

    useEffect(() => {
        const trimmed = value.trim().toLowerCase();
        if (!trimmed) {
            setState("idle");
            return;
        }

        if (field === "username") {
            if (trimmed.length < 2 || trimmed.length > 32 || !USERNAME_REGEX.test(trimmed)) {
                setState("format");
                return;
            }
        } else if (field === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                setState("format");
                return;
            }
        }

        setState("checking");
        const id = ++seq.current;
        const t = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ [field]: trimmed });
                const res = await fetch(`/api/auth/check-availability?${params}`);
                const json = await res.json();
                if (id !== seq.current) return;
                setState(json.available ? "available" : "taken");
            } catch {
                if (id !== seq.current) return;
                setState("idle");
            }
        }, 400);

        return () => clearTimeout(t);
    }, [field, value]);

    return state;
}

export default function SignUpPage() {
    const t = useTranslations("auth.signup");
    const tv = useTranslations("auth.validation");
    const [state, action, pending] = useActionState(signUp, undefined);
    const values = state?.values ?? {};

    const [emailVal, setEmailVal] = useState(values.email ?? "");
    const [usernameVal, setUsernameVal] = useState(values.userName ?? "");

    const emailState = useAvailability("email", emailVal);
    const usernameState = useAvailability("username", usernameVal);

    const usernameHelper = (() => {
        if (usernameState === "checking") return { validating: true };
        if (usernameState === "format") return { error: tv("usernameFormat") };
        if (usernameState === "taken") return { error: tv("usernameTaken") };
        if (usernameState === "available") return { success: tv("usernameAvailable") };
        return {};
    })();

    const emailHelper = (() => {
        if (emailState === "checking") return { validating: true };
        if (emailState === "format") return { error: tv("emailFormat") };
        if (emailState === "taken") return { error: tv("emailTaken") };
        if (emailState === "available") return { success: tv("emailAvailable") };
        return {};
    })();

    return (
        <AuthShell
            eyebrow={t("eyebrow")}
            headline={{ blue: t("headlineBlue"), italic: t("headlineItalic") }}
            sub={t("sub")}
            footer={
                <div className="text-ink2" style={{ fontSize: 12, textAlign: "center" }}>
                    {t("haveAccount")}{" "}
                    <Link href="/login" style={{ color: "#9D0010", fontWeight: 700 }}>
                        {t("signIn")}
                    </Link>
                </div>
            }
        >
            {state?.success === false && state?.message && (
                <ErrorNotification
                    key={`${state?.message}-${Date.now()}`}
                    error={state.message}
                />
            )}

            <SocialAuthBlock />

            <Form action={action}>
                <Input
                    name={FormFieldsKeysEntity.signUpGroup.EMAIL}
                    id="email"
                    type="email"
                    label={t("fields.email")}
                    placeHolder={t("fields.emailPlaceholder")}
                    value={values.email}
                    autoComplete="email"
                    required
                    hint={t("fields.emailHint")}
                    error={state?.errors?.email}
                    onChange={(e) => setEmailVal(e.target.value)}
                    {...emailHelper}
                />

                <Input
                    name={FormFieldsKeysEntity.signUpGroup.USERNAME}
                    id="userName"
                    type="text"
                    label={t("fields.userName")}
                    placeHolder={t("fields.userNamePlaceholder")}
                    value={values.userName}
                    autoComplete="username"
                    required
                    hint={t("fields.userNameHint")}
                    error={state?.errors?.userName}
                    onChange={(e) => setUsernameVal(e.target.value)}
                    {...usernameHelper}
                />

                <Input
                    name={FormFieldsKeysEntity.signUpGroup.TAG}
                    id="tag"
                    type="text"
                    label={t("fields.tag")}
                    placeHolder={t("fields.tagPlaceholder")}
                    value={values.tag}
                    hint={t("fields.tagHint", {
                        userName: usernameVal || t("fields.tagHintFallback"),
                    })}
                    error={state?.errors?.tag}
                />

                <PasswordInput
                    label={t("fields.password")}
                    value={values.password}
                    autoComplete="new-password"
                    error={state?.errors?.password}
                    hint={t("fields.passwordHint")}
                />

                <label
                    className="flex items-start gap-2 text-ink2"
                    style={{ fontSize: 12, margin: "8px 0 18px" }}
                >
                    <input
                        type="checkbox"
                        defaultChecked
                        required
                        style={{ accentColor: "#1E3A8A", marginTop: 2 }}
                    />
                    <span>
                        {t("termsPrefix")}{" "}
                        <span style={{ textDecoration: "underline" }}>{t("terms")}</span>{" "}
                        {t("termsAnd")}{" "}
                        <span style={{ textDecoration: "underline" }}>{t("privacy")}</span>.
                    </span>
                </label>

                <SubmitButton buttonText={t("submit")} pending={pending} />
            </Form>
        </AuthShell>
    );
}
