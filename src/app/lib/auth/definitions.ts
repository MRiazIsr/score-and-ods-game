import { z } from "zod";
import type { SessionOptions } from "./types";
import { getRequiredEnv } from "@/app/lib/helpers/envHeplper";

export const SignUpFormSchema = z.object({
    name: z.string(),
    email: z
        .string()
        .email('Invalid email format'),
    userName: z
        .string()
        .toLowerCase()
        .min(2, { message: 'Name must be at least 2 characters long.' })
        .trim(),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long.' })
        .regex(/[a-zA-z]/, { message: 'Contain at least one letter.'})
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Contain at least one special character.' })
        .trim()
})

export const SignInFormSchema = z.object({
    userName: z
        .string()
        .toLowerCase()
        .min(2, { message: 'User name must be at least 2 characters long.' }),
    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long.' })
        .regex(/[a-zA-z]/, { message: 'Contain at least one letter.'})
        .regex(/[0-9]/, { message: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Contain at least one special character.' })
        .trim()
})

export const sessionOptions: SessionOptions = {
    password: getRequiredEnv('SESSION_PASSWORD'),
    cookieName: getRequiredEnv('SESSION_COOKIE_NAME'),
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    }
}

export type FormState =
    | {
        errors?: {
            email?: string[],
            password?: string[],
        }
        errorCode?: number
        values?: {
            name?: string,
            email?: string,
            userName?: string,
            password?: string,
        }
        message?: string,
    }
    | undefined
