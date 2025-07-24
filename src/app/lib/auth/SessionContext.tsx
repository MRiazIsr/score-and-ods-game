"use client";
import React, { createContext, useContext } from "react";
import { SessionUser } from "@/app/server/modules/user/types/userTypes";


type SessionContextValue = {
    user: SessionUser;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

export function SessionProvider({user, children,}: { user: SessionUser; children: React.ReactNode; }) {
    return (
        <SessionContext.Provider value={{ user }}>
            {children}
        </SessionContext.Provider>
    );
}
