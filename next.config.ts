import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    serverExternalPackages: ["@prisma/client", "argon2"],
    images: {
        remotePatterns: [new URL("https://crests.football-data.org/**")],
    },
};

export default withNextIntl(nextConfig);
