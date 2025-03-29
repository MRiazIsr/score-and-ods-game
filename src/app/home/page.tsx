import { redirect } from 'next/navigation';
import { getSession } from "@/app/actions/auth";

export default async function Home() {
    const session = await getSession();

    if (!session.isLoggedIn) {
        redirect('/login');
    }

    return (
            <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                <h1 className="text-4xl font-bold mb-8">Welcome to the Dashboard</h1>
                <p className="mb-4">You are logged in!</p>
                <button
                    onClick={() => {
                        console.log('clicked');
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
    );
}