export const getRequiredEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

export const getOptionalEnv = (name: string): string | null => {
    const value = process.env[name];
    return value && value.length > 0 ? value : null;
};
