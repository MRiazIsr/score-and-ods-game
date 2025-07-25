interface Area {
    id: number;
    name: string;
    code: string;
    flag: string;
}

export interface Competition {
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

export interface Match {
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
    predictedScore?: PredictedScore;
    odds: Odds;
    referees: never[];
    isStarted?: boolean;// You might want to define a Referee interface if you have referee data
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

export interface PredictedScore {
    home: number;
    away: number;
    isPredicted: boolean;
}

// Scoreboard interfaces
export interface ScoreBoardEntry {
    userId: string;
    userName: string;
    predictedCount: number;
    predictedDifference: number;
    predictedOutcome: number;
    points: number;
}

export interface ScoreBoardData {
    competitionId: number;
    competitionName: string;
    entries: ScoreBoardEntry[];
}

export interface UserPrediction {
    userId: string;
    userName: string;
    matchId: number;
    predictedHome: number;
    predictedAway: number;
    actualHome: number | null;
    actualAway: number | null;
    points: number;
}

export interface MatchResult {
    matchId: number;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
}