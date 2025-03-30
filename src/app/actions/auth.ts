"use server";

import {FormState, SignInFormSchema, SignUpFormSchema} from "@/app/lib/auth/definitions";
import { selectFactory } from '@/app/server/modules/factories/authFactory/AuthFactorySelector'
import {SessionUser, User} from "@/app/server/modules/user/types/userTypes";
import {SafeParseReturnType} from "zod";
import {DynamoDbAuthFactory} from "@/app/server/modules/factories/authFactory/DynamoDbAuthFactory";
import {AuthService} from "@/app/server/services/auth/AuthService";
import {FormFieldsKeys} from "@/app/server/entities/FormFieldsKeys";
// import { getIronSession, IronSession } from "iron-session";
// import { cookies } from "next/headers";
// import { SessionData } from "@/app/lib/auth/types";
// import { sessionOptions } from "@/app/lib/auth/definitions";

// export async function getSession(): Promise<IronSession<SessionData>>
// {
//     const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
//     if (!session.isLoggedIn) {
//         session.isLoggedIn = false;
//         session.user = {
//             name: '',
//             email: '',
//             userId: '',
//             userName: '',
//             userType: 0,
//         };
//     }
//
//     return session;
// }

export async function signUp(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] }
    values?: { name?: string; email?: string; userName?: string; password?: string };
}> {
    const formFields = {
        name: formData.get(FormFieldsKeys.signUpGroup.NAME)?.toString() ?? '',
        email: formData.get(FormFieldsKeys.signUpGroup.EMAIL)?.toString() ?? '',
        userName: formData.get(FormFieldsKeys.signUpGroup.USERNAME)?.toString(),
        password: formData.get(FormFieldsKeys.signUpGroup.PASSWORD)?.toString()
    }

    console.log(formFields);

    const validatedFields: SafeParseReturnType<User, User> = SignUpFormSchema.safeParse( formFields )

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;

        const cleanValues = {
            ...formFields,
            ...Object.keys(fieldErrors).reduce((acc, key) => ({
                ...acc,
                [key]: undefined
            }), {})
        };

        return {
            message: 'Field Validation Error',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            values: cleanValues
        }
    }

    const authFactory = selectFactory(process.env.DB_TYPE)
    const authService = authFactory.createAuthService();
    //TODO: add type for user creation result
    try {
        const userCreationResult: { message: string } = await authService.createUser( validatedFields.data )
        return {
            success: true,
            message: userCreationResult.message,
            values: formFields,
        }
    } catch (error: unknown) {
        console.error(error)
        if (error instanceof Error) {
            return {
                success: false,
                message: error.message,
                values: {
                    ...formFields,
                    [error.cause as string]: undefined
                }
            }
        }
        return {
            success: false,
            message: 'An unknown error occurred.',
            values: formFields
        }
    }
}

export async function signIn(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] }
}> {
    const formFields = {
        userName: formData.get(FormFieldsKeys.signInGroup.USERNAME)?.toString() ?? '',
        password: formData.get(FormFieldsKeys.signInGroup.PASSWORD)?.toString() ?? '',
    }

    console.log(formFields);

    const validatedFields: SafeParseReturnType<User, User> = SignInFormSchema.safeParse( formFields )

    if (!validatedFields.success) {
        return {
            message: 'Field Validation Error',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const authFactory: DynamoDbAuthFactory = selectFactory(process.env.DB_TYPE)
    const authService: AuthService = authFactory.createAuthService();
    try {
        const userSignInResult: { status: boolean, message: string, sessionUser: SessionUser } = await authService.signIn( validatedFields.data )

        // const session = await getSession();

        // session.isLoggedIn = true;
        // session.user = {
        //     userName: userSignInResult.sessionUser.userName,
        //     userId: userSignInResult.sessionUser.userId,
        //     userType: userSignInResult.sessionUser.userType,
        //     name: userSignInResult.sessionUser.name,
        //     email: userSignInResult.sessionUser.email,
        // };
        // await session.save();

        return {
            success: true,
            message: userSignInResult.message
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                message: error.message
            }
        }
        return {
            success: false,
            message: 'An unknown error occurred.'
        }
    }
}