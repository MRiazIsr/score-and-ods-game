// Minimal football-data.org v4 response types — only fields we actually consume.
// Full API docs: https://docs.football-data.org/general/v4/

export interface ApiTeamRef {
    id: number;
    name: string;
    shortName?: string | null;
    tla?: string | null;
    crest?: string | null;
}

export interface ApiSeason {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number | null;
    winner: string | null;
}

export interface ApiCompetitionRef {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem?: string | null;
}

export interface ApiCompetitionDetailsResponse extends ApiCompetitionRef {
    currentSeason: ApiSeason;
}

export interface ApiMatchScore {
    winner: string | null;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
}

export interface ApiMatch {
    id: number;
    utcDate: string;
    status:
        | "SCHEDULED"
        | "TIMED"
        | "IN_PLAY"
        | "PAUSED"
        | "FINISHED"
        | "POSTPONED"
        | "SUSPENDED"
        | "CANCELLED"
        | "CANCELED"
        | string;
    matchday: number | null;
    stage: string | null;
    group: string | null;
    homeTeam: ApiTeamRef;
    awayTeam: ApiTeamRef;
    score: ApiMatchScore;
    season?: ApiSeason;
    competition?: ApiCompetitionRef;
    goals?: unknown;
    bookings?: unknown;
    substitutions?: unknown;
    lineups?: unknown;
}

export interface ApiMatchesResponse {
    filters: { season: string };
    competition: ApiCompetitionRef;
    matches: ApiMatch[];
}

export interface ApiTeamsResponse {
    count: number;
    filters: { season: string };
    teams: ApiTeamRef[];
}

export interface ApiStandingsTableRow {
    position: number;
    team: ApiTeamRef;
    playedGames: number;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

export interface ApiStandingsGroup {
    stage: string;
    type: "TOTAL" | "HOME" | "AWAY";
    group: string | null;
    table: ApiStandingsTableRow[];
}

export interface ApiStandingsResponse {
    filters: { season: string };
    standings: ApiStandingsGroup[];
    season?: ApiSeason;
}

export interface ApiScorer {
    player: {
        id: number;
        name: string;
        position?: string | null;
        nationality?: string | null;
        dateOfBirth?: string | null;
    };
    team: ApiTeamRef;
    goals: number;
    assists?: number | null;
    penalties?: number | null;
    playedMatches?: number | null;
}

export interface ApiScorersResponse {
    count: number;
    filters: { season: string };
    scorers: ApiScorer[];
}
