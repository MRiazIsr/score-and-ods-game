import axios, { AxiosInstance } from "axios";

export const UNFOLD_HEADERS = {
    "X-Unfold-Goals": "true",
    "X-Unfold-Lineups": "true",
    "X-Unfold-Bookings": "true",
    "X-Unfold-Subs": "true",
};

export interface FetcherConfig {
    apiKey: string;
    apiUrl: string;
}

export function createApiClient(config: FetcherConfig): AxiosInstance {
    return axios.create({
        baseURL: config.apiUrl,
        headers: {
            "X-Auth-Token": config.apiKey,
        },
        timeout: 30_000,
    });
}

export function loadConfig(): FetcherConfig {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY env var not set");
    const apiUrl = process.env.API_URL ?? "https://api.football-data.org/v4";
    return { apiKey, apiUrl };
}
