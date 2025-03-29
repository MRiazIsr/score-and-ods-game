import { SessionUser } from "@/app/server/modules/user/types/userTypes";

export type SessionData = {
    user: SessionUser;
    isLoggedIn: boolean;
}

export type SessionOptions = {
    password: string
    cookieName: string
    cookieOptions: {
        secure: boolean,
    }
}
