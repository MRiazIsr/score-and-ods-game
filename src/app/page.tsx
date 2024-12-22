import { Card } from "./components/Card";
import { SubmitButton } from "./components/SubmitButton"
import Link from "next/link";


export default function Home() {
  return (
      <main className="flex min-h-screen items-center justify-center">
        <Card
            title="TIP MANAGER"
            description="Please Log In "
        >
            <Input placeholder="Email" />
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
