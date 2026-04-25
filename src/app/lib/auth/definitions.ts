import { z } from "zod";
import type { SessionOptions } from "./types";
import { getRequiredEnv } from "@/app/lib/helpers/envHeplper";

export const SignUpFormSchema = z.object({
    tag: z
        .string()
        .trim()
        .max(64, { message: "Tag must be 64 characters or fewer." })
        .optional()
        .or(z.literal("").transform(() => undefined)),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email({ message: "Invalid email format." }),
    userName: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, { message: "Username must be at least 2 characters." })
        .max(32, { message: "Username must be 32 characters or fewer." })
        .regex(/^[a-z0-9_]+$/, {
            message: "Only lowercase letters, digits and underscore are allowed.",
        }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
        .regex(/[0-9]/, { message: "Must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, { message: "Must contain at least one special character." }),
});

export const SignInFormSchema = z.object({
    userName: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, { message: "Username must be at least 2 characters." }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
});

export const sessionOptions: SessionOptions = {
    password: getRequiredEnv('SESSION_PASSWORD'),
    cookieName: getRequiredEnv('SESSION_COOKIE_NAME'),
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export type FormState =
    | {
        errors?: {
            tag?: string[];
            email?: string[];
            userName?: string[];
            password?: string[];
        };
        errorCode?: number;
        values?: {
            tag?: string;
            email?: string;
            userName?: string;
            password?: string;
        };
        message?: string;
        success?: boolean;
    }
    | undefined;
