import { Card } from "./components/ui/Card";
import { SubmitButton } from "./components/ui/SubmitButton"
import Link from "next/link";
import {Input} from "@/app/components/ui/Input";


export default function Home() {
  return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-950 from-10% via-violet-950 via-30% to-emerald-950 to-90%">
        <Card
            title="TIP MANAGER"
            description="Please Log In "
        >
            <Input name={'email'} id={'email'} type={'email'} value={''} placeHolder={'email@example.com'}/>
            <Input name={'password'} id={'password'} type={'password'} value={''} placeHolder={'********'}/>
            <SubmitButton buttonText="Sign In"/>
            <div className={'flex flex-row space-x-2 justify-center'}>
                <Link
                    href="/about"
                    className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                    aria-label="Navigate to About page"
                >
                    About
                </Link>
                <Link
                   href="/forgot-password"
                   className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                   aria-label="Navigate to Forgot Password page"
                >
                    Forgot Password
                </Link>
                <Link
                    href="/contact-us"
                    className="text-blue-500 hover:text-blue-700 text-xs rounded-lg transition-colors"
                    aria-label="Navigate to Contact Us page"
                >
                    Contact Us
                </Link>
            </div>
        </Card>
      </main>
  );
}
