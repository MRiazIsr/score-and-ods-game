"use server";

import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
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

    // Validate the session's user still exists in Postgres.
    // Covers: user deleted after login, user banned, and stale cookies from before a DB reset.
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
        // On DB error, keep session as-is — downstream calls will surface the error.
    }
    return session;
}

export async function signUp(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    shouldRedirect?: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] };
    values?: { name?: string; email?: string; userName?: string; password?: string };
}> {
    const formFields = {
        name: formData.get(FormFieldsKeysEntity.signUpGroup.NAME)?.toString() ?? "",
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
            message: "Please fix the highlighted fields.",
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

        return {
            success: true,
            message: "Registration successful",
            shouldRedirect: true,
        };
    } catch (err) {
        logError("actions/auth.signUp", err, {
            userName: formFields.userName,
            email: formFields.email,
        });
        return {
            success: false,
            message: friendlyMessage(err, "Registration failed. Please try again."),
            values: err instanceof Error && typeof err.cause === "string"
                ? { ...formFields, [err.cause]: undefined }
                : formFields,
        };
    }
}

export async function signIn(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    shouldRedirect?: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] };
}> {
    const formFields = {
        userName: formData.get(FormFieldsKeysEntity.signInGroup.USERNAME)?.toString() ?? "",
        password: formData.get(FormFieldsKeysEntity.signInGroup.PASSWORD)?.toString() ?? "",
    };

    const validatedFields = SignInFormSchema.safeParse(formFields);

    if (!validatedFields.success) {
        return {
            message: "Please check your inputs.",
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

        return {
            success: true,
            message: "Login successful",
            shouldRedirect: true,
        };
    } catch (err) {
        logError("actions/auth.signIn", err, { userName: formFields.userName });
        return {
            success: false,
            message: friendlyMessage(err, "Sign-in failed. Please try again."),
        };
    }
}

export async function signOut() {
    try {
        const session = await getSession();
        session.destroy();
    } catch (err) {
        logError("actions/auth.signOut", err);
    }
}
