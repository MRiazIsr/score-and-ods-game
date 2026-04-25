import argon2 from "argon2";
import { userRepository } from "@/app/server/db/repositories/userRepository";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import type { SessionUser, SignInInput, SignUpInput } from "@/app/lib/auth/types";

export type OAuthProvider = "google" | "telegram";

export interface OAuthUpsertInput {
    provider: OAuthProvider;
    providerId: string;
    email: string | null;
    /** Whether the provider verified the email (Google: from id_token claim). Telegram: ignored. */
    emailVerified?: boolean;
    /** Hint for username generation (email local part, telegram username, etc.). */
    usernameHint?: string;
}

function sessionUserOf(user: {
    id: string;
    username: string;
    tag: string | null;
    email: string | null;
    isAdmin: boolean;
}): SessionUser {
    return {
        userId: user.id,
        userName: user.username,
        tag: user.tag,
        email: user.email,
        isAdmin: user.isAdmin,
    };
}

export class AuthService {
    async createUser(input: SignUpInput): Promise<SessionUser> {
        const usernameTaken = await userRepository.existsByUsername(input.userName);
        if (usernameTaken) {
            throw new Error("User with this username already exists", {
                cause: FormFieldsKeysEntity.signUpGroup.USERNAME,
            });
        }

        const emailTaken = await userRepository.existsByEmail(input.email);
        if (emailTaken) {
            throw new Error("User with this email already exists", {
                cause: FormFieldsKeysEntity.signUpGroup.EMAIL,
            });
        }

        const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });

        const user = await userRepository.create({
            username: input.userName,
            email: input.email,
            tag: input.tag && input.tag.length > 0 ? input.tag : null,
            passwordHash,
        });

        return sessionUserOf(user);
    }

    /**
     * Find or create a user from a verified OAuth identity.
     *
     * Resolution order:
     *  1. Match by providerId → that user.
     *  2. (Google with verified email only) match by email → link providerId to that user.
     *  3. Create new user (no password, generated unique username).
     */
    async upsertOAuthUser(input: OAuthUpsertInput): Promise<SessionUser> {
        const { provider, providerId, email, emailVerified, usernameHint } = input;

        const byProvider =
            provider === "google"
                ? await userRepository.findByGoogleId(providerId)
                : await userRepository.findByTelegramId(providerId);
        if (byProvider) {
            if (byProvider.isBanned) throw new Error("Account suspended");
            return sessionUserOf(byProvider);
        }

        if (provider === "google" && email && emailVerified) {
            const byEmail = await userRepository.findByEmail(email);
            if (byEmail) {
                if (byEmail.isBanned) throw new Error("Account suspended");
                await userRepository.linkGoogleId(byEmail.id, providerId);
                return sessionUserOf({ ...byEmail, email: byEmail.email });
            }
        }

        const seed = usernameHint || (email ? email.split("@")[0] : provider);
        const username = await userRepository.generateUniqueUsername(seed);
        const created = await userRepository.createOAuth({
            username,
            email: email ?? null,
            googleId: provider === "google" ? providerId : undefined,
            telegramId: provider === "telegram" ? providerId : undefined,
        });
        return sessionUserOf(created);
    }

    async signIn(
        input: SignInInput,
    ): Promise<{ status: boolean; message: string; sessionUser: SessionUser }> {
        const user = await userRepository.findByUsername(input.userName);
        if (!user || !user.passwordHash) {
            throw new Error("Invalid credentials");
        }

        if (user.isBanned) {
            throw new Error("Account suspended");
        }

        const passwordOk = await argon2.verify(user.passwordHash, input.password);
        if (!passwordOk) {
            throw new Error("Invalid credentials");
        }

        return {
            status: true,
            message: "User Logged In Successfully",
            sessionUser: sessionUserOf(user),
        };
    }
}
