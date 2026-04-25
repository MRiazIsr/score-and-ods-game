/**
 * Build an absolute app URL for use in OAuth redirects.
 *
 * `request.url` in a Next.js Route Handler reflects the container's bind address
 * (HOSTNAME=0.0.0.0:3000 in our Dockerfile). Behind a reverse proxy (Caddy → Cloudflare)
 * we must reconstruct the public-facing URL from forwarded headers — otherwise
 * we'd redirect users to `https://0.0.0.0:3000/...`.
 */
export function buildAppUrl(request: Request, path: string): URL {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = forwardedHost ?? request.headers.get("host");
    const proto = forwardedProto ?? (forwardedHost ? "https" : new URL(request.url).protocol.replace(":", ""));

    if (host) {
        return new URL(path, `${proto}://${host}`);
    }
    return new URL(path, request.url);
}
