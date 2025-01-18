import { SignUpFormSchema, FormState } from "@/app/lib/definitions";
import { selectFactory } from '@/app/modules/factories/authFactory/AuthFactorySelector'

export async function signup(state: FormState, formData: FormData) {
    const validatedFields = SignUpFormSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const authFactory = selectFactory(process.env.DB_TYPE)
    const authService = authFactory.createAuthService();
    //TODO: add type for user creation result
    try {
        const userCreationResult = await authService.createUser({
            username: formData.get("email"),
            password: formData.get("password"),
        })

        return {
            success: true,
            message: userCreationResult.message
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.message
            }
        }
        return {
            success: false,
            message: 'An unknown error occurred.'
        }
    }
}