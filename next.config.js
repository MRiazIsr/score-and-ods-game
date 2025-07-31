const nextConfig = {
    output: 'standalone',

    experimental: {
        serverComponentsExternalPackages: [
            '@aws-sdk/client-dynamodb',
            '@aws-sdk/lib-dynamodb',
        ],
    },

    serverExternalPackages: [
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/lib-dynamodb',
    ],

    env: {
        DB_TYPE: process.env.DB_TYPE,
        TABLE_NAME: process.env.TABLE_NAME,
        API_URL: process.env.API_URL,
        AWS_REGION: process.env.AWS_REGION,
        AWS_TABLE_NAME: process.env.AWS_TABLE_NAME,
    },

    images: {
        formats: ['image/webp', 'image/avif'],
        remotePatterns: [new URL('https://crests.football-data.org/**')],
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
};