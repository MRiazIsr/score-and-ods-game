export type DbUser = {
    name: string
    email: string
    userId: string
    password: string
    userName: string
    userType: number
    salt: string
}

export type User = {
    name?: string
    email?: string
    password: string
    userName: string
    userType?: number
}

export type SessionUser = {
    name: string
    email: string
    userId: string
    userName: string
    userType: number
}