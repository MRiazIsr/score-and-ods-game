/**
 * Server-side error helpers: structured logging + safe user-facing messages.
 *
 * Rules:
 *  - Never leak raw error messages or stack traces to the client.
 *  - Always log full context server-side (console → captured by Docker / journald).
 *  - Map known Prisma error codes to friendly messages.
 */

type LogContext = Record<string, string | number | boolean | null | undefined>;

interface PrismaLikeError {
    code?: string;
    message?: string;
    meta?: Record<string, unknown>;
}

const isPrismaError = (e: unknown): e is PrismaLikeError =>
    !!e && typeof e === "object" && "code" in e && typeof (e as PrismaLikeError).code === "string";

/**
 * Log an error with a named context tag + structured metadata.
 * Goes to stdout/stderr → journald on the VPS.
 */
export function logError(
    tag: string,
    err: unknown,
    context: LogContext = {},
): void {
    const base = {
        tag,
        ...context,
        message: err instanceof Error ? err.message : String(err),
    };
    if (isPrismaError(err)) {
        console.error(`[${tag}]`, {
            ...base,
            prismaCode: err.code,
            prismaMeta: err.meta,
        });
    } else {
        console.error(`[${tag}]`, base, err instanceof Error ? err.stack : undefined);
    }
}

/**
 * Translate an error into a safe user-facing message.
 * Returns a short, neutral string. Never surfaces stack traces or internal details.
 */
export function friendlyMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
    if (isPrismaError(err)) {
        switch (err.code) {
            case "P2003":
                // Foreign key violation — commonly stale session / deleted linked record.
                return "Your session is no longer valid. Please sign in again.";
            case "P2002":
                // Unique constraint violation.
                return "This record already exists.";
            case "P2025":
                // Record not found.
                return "The item you requested was not found.";
            default:
                return fallback;
        }
    }
    if (err instanceof Error) {
        // Pass through explicit user-safe messages thrown by services.
        // Service errors like "Match has already started" are intentionally user-facing.
        const msg = err.message;
        if (msg && msg.length < 200 && !msg.includes("prisma") && !msg.includes("PrismaClient")) {
            return msg;
        }
    }
    return fallback;
}
