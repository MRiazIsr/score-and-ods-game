"use server"

import {FormState, SignInFormSchema, SignUpFormSchema} from "@/app/lib/definitions";
import { selectFactory } from '@/app/server/modules/factories/authFactory/AuthFactorySelector'
//import {redirect} from "next/navigation";

export async function signUp(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] }
}> {
    const formFields = {
        name: formData.get("name")?.toString(),
        email: formData.get("email")?.toString(),
        userName: formData.get("userName")?.toString() ?? '',
        password: formData.get("password")?.toString()
    }

    console.log(formFields);

    const validatedFields = SignUpFormSchema.safeParse( formFields )

    if (!validatedFields.success) {
        return {
            message: 'Field Validation Error',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const authFactory = selectFactory(process.env.DB_TYPE)
    const authService = authFactory.createAuthService();
    //TODO: add type for user creation result
    try {
        const userCreationResult: { message: string } = await authService.createUser( formFields )
        //redirect('/login')
        return {
            success: true,
            message: userCreationResult.message
        }
    } catch (error: unknown) {
        console.error(error)
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

export async function signIn(state: FormState, formData: FormData): Promise<{
    message: string;
    success: boolean;
    errors?: { name?: string[]; email?: string[]; userName?: string[]; password?: string[] }
}> {
    const formFields = {
        userName: formData.get("email")?.toString() ?? '',
        password: formData.get("password")?.toString() ?? '',
    }

    console.log(formFields);

    const validatedFields = SignInFormSchema.safeParse( formFields )

    if (!validatedFields.success) {
        return {
            message: 'Field Validation Error',
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const authFactory = selectFactory(process.env.DB_TYPE)
    const authService = authFactory.createAuthService();
    //TODO: add type for user creation result
    try {
        const userCreationResult: { message: string } = await authService.login( formFields )

        return {
            success: true,
            message: userCreationResult.message
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