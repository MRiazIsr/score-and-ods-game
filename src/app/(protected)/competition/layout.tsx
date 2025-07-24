import { ReactNode } from 'react';
import { getSession } from "@/app/actions/auth";
import { redirect } from "next/navigation";

export default async function CompetitionLayout({children}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/login');
  }

  return (
      <main className="flex-1 overflow-y-auto p-6 pt-24">
        <div className="container mx-auto max-w-6xl">
          {children}
        </div>
      </main>
  );
}
