"use client";

import { SubmitButton } from "@/app/client/components/ui/SubmitButton";
import { Input } from "@/app/client/components/ui/Input";
import { PasswordInput } from "@/app/client/components/ui/PasswordInput";
import { ErrorNotification } from "@/app/client/components/ui/ErrorNotice";
import { AuthShell } from "@/app/client/components/stadium/AuthShell";
import { SocialAuthBlock } from "@/app/client/components/ui/SocialAuthBlock";
import Link from "next/link";
import Form from "next/form";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "@/app/actions/auth";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";

const OAUTH_ERROR_KEYS: Record<string, string> = {
    oauth_not_configured: "notConfigured",
    oauth_state_mismatch: "stateMismatch",
    oauth_email_unverified: "emailUnverified",
    oauth_failed: "failed",
};

export default function LoginForm() {
    const t = useTranslations("auth.login");
    const tSocial = useTranslations("auth.social");
    const [state, action, pending] = useActionState(signIn, undefined);

    const searchParams = useSearchParams();
    const errorParam = searchParams.get("error");
    const oauthErrorKey = errorParam ? OAUTH_ERROR_KEYS[errorParam] : null;
    const oauthErrorMessage = oauthErrorKey ? tSocial(oauthErrorKey) : null;

    return (
        <AuthShell
            eyebrow={t("eyebrow")}
            headline={{ blue: t("headlineBlue"), italic: t("headlineItalic") }}
            sub={t("sub")}
            footer={
                <div className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <Link
                        href="/forgot-password"
                        className="text-ink2 hover:text-ink"
                        style={{ fontWeight: 500 }}
                    >
                        {t("forgotPassword")}
                    </Link>
                    <span className="text-ink2">
                        {t("newHere")}{" "}
                        <Link href="/signup" style={{ color: "#9D0010", fontWeight: 700 }}>
                            {t("createAccount")}
                        </Link>
                    </span>
                </div>
            }
        >
            {oauthErrorMessage && (
                <ErrorNotification error={oauthErrorMessage} />
            )}

            {state?.success === false && state?.message && (
                <ErrorNotification error={state.message} />
            )}

            <SocialAuthBlock />

            <Form action={action}>
                <Input
                    name={FormFieldsKeysEntity.signInGroup.USERNAME}
                    id="userName"
                    type="text"
                    label={t("fields.userName")}
                    placeHolder={t("fields.userNamePlaceholder")}
                    autoComplete="username"
                    required
                    error={state?.errors?.userName}
                />

                <PasswordInput
                    label={t("fields.password")}
                    value=""
                    autoComplete="current-password"
                    error={state?.errors?.password}
                />

                <label
                    className="flex items-center gap-2 text-ink2"
                    style={{ fontSize: 12, marginBottom: 18, marginTop: 4 }}
                >
                    <input type="checkbox" defaultChecked style={{ accentColor: "#1E3A8A" }} />
                    <span>{t("rememberMe")}</span>
                </label>

                <SubmitButton buttonText={t("submit")} pending={pending} />
            </Form>
        </AuthShell>
    );
}
