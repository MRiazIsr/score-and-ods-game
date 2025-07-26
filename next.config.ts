import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: [
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/lib-dynamodb',
    ],
    /* config options here */
    env: {
        DB_TYPE: process.env.DB_TYPE,
        TABLE_NAME: process.env.TABLE_NAME,
        API_URL: process.env.API_URL,
        AWS_REGION: process.env.AWS_REGION,
        AWS_TABLE_NAME: process.env.AWS_TABLE_NAME,
    },
    images: {
        remotePatterns: [new URL('https://crests.football-data.org/**')],
    },
};

export default nextConfig;
