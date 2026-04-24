import { getSession } from "@/app/actions/auth";
import LoginForm from "@/app/login/LoginForm";
import {IronSession} from "iron-session";
import {SessionData} from "@/app/lib/auth/types";
import {redirect} from "next/navigation";


const LoginPage = async () => {
    const session: IronSession<SessionData> = await getSession();

    if (session.isLoggedIn) {
        redirect("/home");
    }

    return ( <LoginForm/> );

};

export default LoginPage;