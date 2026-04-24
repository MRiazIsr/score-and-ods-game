import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["@prisma/client", "argon2"],
    images: {
        remotePatterns: [new URL("https://crests.football-data.org/**")],
    },
};

export default nextConfig;
