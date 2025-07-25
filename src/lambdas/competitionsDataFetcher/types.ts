interface Area {
    id: number;
    name: string;
    code: string;
    flag: string;
}

interface Competition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
}

interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
}

interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

interface ScoreDetail {
    home: number | null;
    away: number | null;
}

interface Score {
    winner: string | null;
    duration: string;
    fullTime: ScoreDetail;
    halfTime: ScoreDetail;
}

interface Odds {
    msg: string;
}

interface Match {
    area: Area;
    competition: Competition;
    season: Season;
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: Team;
    awayTeam: Team;
    score: Score;
    odds: Odds;
    referees: never[]; // You might want to define a Referee interface if you have referee data
}

interface Filters {
    season: string;
}

interface ResultSet {
    count: number;
    first: string;
    last: string;
    played: number;
}

// Main response interface
export interface MatchesResponse {
    filters: Filters;
    resultSet: ResultSet;
    competition: Competition;
    matches: Match[];
}