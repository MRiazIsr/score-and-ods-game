import { getSession } from "@/app/actions/auth";
import LoginForm from "@/app/login/LoginForm";
import { redirect } from "next/navigation"
import {IronSession} from "iron-session";
import {SessionData} from "@/app/lib/auth/types";

const LoginPage = async () => {
    const session: IronSession<SessionData> = await getSession();

    if (session.isLoggedIn) {
        redirect("/");
    }

    return ( <LoginForm/> );

};

export default LoginPage;