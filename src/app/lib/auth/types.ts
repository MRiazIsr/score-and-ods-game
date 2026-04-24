export type SessionUser = {
    userId: string;
    userName: string;
    name: string;
    email: string;
    isAdmin: boolean;
};

export type SessionData = {
    user: SessionUser;
    isLoggedIn: boolean;
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
    name: string;
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
    name: "",
    email: "",
    isAdmin: false,
};
