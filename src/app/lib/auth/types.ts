export type SessionUser = {
    userId: string;
    userName: string;
    tag: string | null;
    email: string | null;
    isAdmin: boolean;
};

export type SessionData = {
    user: SessionUser;
    isLoggedIn: boolean;
    locale?: string;
};

export type SessionOptions = {
    password: string;
    cookieName: string;
    cookieOptions: {
        secure: boolean;
    };
};

/** Input shape for sign-up form validation. */
export type SignUpInput = {
    tag?: string;
    email: string;
    userName: string;
    password: string;
};

/** Input shape for sign-in form validation. */
export type SignInInput = {
    userName: string;
    password: string;
};

export const EMPTY_SESSION_USER: SessionUser = {
    userId: "",
    userName: "",
    tag: null,
    email: null,
    isAdmin: false,
};
