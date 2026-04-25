"use server";

import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FormState, SignInFormSchema, SignUpFormSchema, sessionOptions } from "@/app/lib/auth/definitions";
import { EMPTY_SESSION_USER, SessionData } from "@/app/lib/auth/types";
import { AuthService } from "@/app/server/services/auth/AuthService";
import { userRepository } from "@/app/server/db/repositories/userRepository";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import { friendlyMessage, logError } from "@/app/lib/errors";

export async function getSession(): Promise<IronSession<SessionData>> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) {
        session.isLoggedIn = false;
        session.user = { ...EMPTY_SESSION_USER };
        return session;
    }

    const userId = session.user?.userId;
    if (!userId) {
        session.destroy();
        return session;
    }
    try {
        const user = await userRepository.findById(userId);
        if (!user || user.isBanned) {
            session.destroy();
        }
    } catch (err) {
        logError("actions/auth.getSession.validate", err, { userId });
    }
    return session;
}

/**
 * Map a known English service error message to a translation key.
 * Keeping the English message in throws lets logs stay readable;
 * this layer turns it into a user-facing localized string.
 */
function localizeAuthError(rawMessage: string): string | null {
    switch (rawMessage) {
        case "User with this username already exists":
            return "usernameTaken";
        case "User with this email already exists":
            return "emailTaken";
        case "Invalid credentials":
            return "invalidCredentials";
        case "Account suspended":
            return "accountSuspended";
        default:
            return null;
    }
}

export async function signUp(state: FormState, formData: FormData): Promise<FormState> {
    const t = await getTranslations("auth.errors");

    const formFields = {
        tag: formData.get(FormFieldsKeysEntity.signUpGroup.TAG)?.toString() ?? "",
        email: formData.get(FormFieldsKeysEntity.signUpGroup.EMAIL)?.toString() ?? "",
        userName: formData.get(FormFieldsKeysEntity.signUpGroup.USERNAME)?.toString() ?? "",
        password: formData.get(FormFieldsKeysEntity.signUpGroup.PASSWORD)?.toString() ?? "",
    };

    const validatedFields = SignUpFormSchema.safeParse(formFields);

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        const cleanValues = {
            ...formFields,
            ...Object.keys(fieldErrors).reduce(
                (acc, key) => ({ ...acc, [key]: undefined }),
                {},
            ),
        };
        return {
            message: t("fixHighlighted"),
            success: false,
            errors: fieldErrors,
            values: cleanValues,
        };
    }

    try {
        const authService = new AuthService();
        const sessionUser = await authService.createUser(validatedFields.data);

        const session = await getSession();
        session.isLoggedIn = true;
        session.user = sessionUser;
        await session.save();
    } catch (err) {
        logError("actions/auth.signUp", err, {
            userName: formFields.userName,
            email: formFields.email,
        });
        const raw = err instanceof Error ? err.message : "";
        const key = localizeAuthError(raw);
        const message = key ? t(key) : friendlyMessage(err, t("registrationFailed"));
        return {
            success: false,
            message,
            values: err instanceof Error && typeof err.cause === "string"
                ? { ...formFields, [err.cause]: undefined }
                : formFields,
        };
    }

    redirect("/dashboard");
}

export async function signIn(state: FormState, formData: FormData): Promise<FormState> {
    const t = await getTranslations("auth.errors");

    const formFields = {
        userName: formData.get(FormFieldsKeysEntity.signInGroup.USERNAME)?.toString() ?? "",
        password: formData.get(FormFieldsKeysEntity.signInGroup.PASSWORD)?.toString() ?? "",
    };

    const validatedFields = SignInFormSchema.safeParse(formFields);

    if (!validatedFields.success) {
        return {
            message: t("checkInputs"),
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    try {
        const authService = new AuthService();
        const { sessionUser } = await authService.signIn(validatedFields.data);

        const session = await getSession();
        session.isLoggedIn = true;
        session.user = sessionUser;
        await session.save();
    } catch (err) {
        logError("actions/auth.signIn", err, { userName: formFields.userName });
        const raw = err instanceof Error ? err.message : "";
        const key = localizeAuthError(raw);
        const message = key ? t(key) : friendlyMessage(err, t("signInFailed"));
        return {
            success: false,
            message,
        };
    }

    redirect("/dashboard");
}

export async function signOut() {
    try {
        const session = await getSession();
        session.destroy();
    } catch (err) {
        logError("actions/auth.signOut", err);
    }
}
