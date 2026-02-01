"use client";

import { useSession } from "@/app/lib/auth/SessionContext";
import { useActionState, useState } from "react";
import { signOut } from "@/app/actions/auth";
import { montserrat } from "@/app/client/fonts/fonts";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
    const [, logOut, pending] = useActionState(signOut, undefined);
    const session = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const isHomePage = pathname === "/home";
    const isScoreboard = pathname === "/scoreboard";

    const handleNavigation = (path: string) => {
        router.push(path);
        setOpen(false);
    };

    return (
        <header className={`${montserrat.className} sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}>
            <div className="container flex h-14 items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-2">
                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>TJ Score Game</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-4 py-4">
                                     <p className="text-sm text-muted-foreground">
                                        Welcome, <span className="font-medium text-foreground">{session?.user?.name || 'User'}</span>
                                    </p>
                                    <Button variant={isHomePage ? "secondary" : "ghost"} className="justify-start" onClick={() => handleNavigation('/home')}>
                                        Home
                                    </Button>
                                    <Button variant={isScoreboard ? "secondary" : "ghost"} className="justify-start" onClick={() => handleNavigation('/scoreboard')}>
                                        Score Board
                                    </Button>
                                    <form action={logOut}>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            className="w-full justify-start"
                                            disabled={pending}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            {pending ? "Logging out..." : "Logout"}
                                        </Button>
                                    </form>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    
                    <h1 className="text-lg font-bold hidden md:block">TJ Score Game</h1>
                    <h1 className="text-base font-bold md:hidden">TJ Score Game</h1>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-4">
                    <p className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium text-foreground">{session?.user?.name || 'User'}</span>
                    </p>
                    <nav className="flex items-center gap-2">
                        <Button variant={isHomePage ? "secondary" : "ghost"} onClick={() => router.push('/home')}>
                            Home
                        </Button>
                        <Button variant={isScoreboard ? "secondary" : "ghost"} onClick={() => router.push('/scoreboard')}>
                            Score Board
                        </Button>
                    </nav>
                     <form action={logOut}>
                        <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                            disabled={pending}
                        >
                            {pending ? "..." : "Logout"}
                        </Button>
                    </form>
                </div>

                <div className="flex items-center gap-2">
                     <ModeToggle />
                </div>
            </div>
        </header>
    );
}