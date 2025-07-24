import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    env: {
        DB_TYPE: process.env.DB_TYPE,
        TABLE_NAME: process.env.TABLE_NAME,
    },
    images: {
        remotePatterns: [new URL('https://crests.football-data.org/**')],
    },
};

export default nextConfig;
