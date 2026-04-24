import argon2 from "argon2";
import { userRepository } from "@/app/server/db/repositories/userRepository";
import { FormFieldsKeysEntity } from "@/app/server/entities/FormFieldsKeysEntity";
import type { SessionUser, SignInInput, SignUpInput } from "@/app/lib/auth/types";

export class AuthService {
    async createUser(input: SignUpInput): Promise<SessionUser> {
        const usernameTaken = await userRepository.existsByUsername(input.userName);
        if (usernameTaken) {
            throw new Error("User with this user name already exists", {
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
            name: input.name,
            passwordHash,
        });

        return {
            userId: user.id,
            userName: user.username,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        };
    }

    async signIn(
        input: SignInInput,
    ): Promise<{ status: boolean; message: string; sessionUser: SessionUser }> {
        const user = await userRepository.findByUsername(input.userName);
        if (!user) {
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
            sessionUser: {
                userId: user.id,
                userName: user.username,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        };
    }
}
