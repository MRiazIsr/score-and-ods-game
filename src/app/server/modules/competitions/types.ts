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
    activeMatchDay: number;
    matchDays: number[];
}

interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
}

// Export Team interface so it can be used in components
export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

// Extended team interface for match data with lineups
export interface TeamWithLineup extends Team {
    lineup?: LineupPlayer[];
    bench?: LineupPlayer[];
    formation?: string;
    coach?: Coach;
    leagueRank?: number;
}

export interface LineupPlayer {
    id: number;
    name: string;
    position?: string;
    shirtNumber?: number;
}

export interface Coach {
    id: number;
    name: string;
    nationality?: string;
}

export interface Goal {
    minute: number;
    injuryTime?: number | null;
    type: string;  // 'REGULAR', 'PENALTY', 'OWN_GOAL'
    team: { id: number; name: string };
    scorer: { id: number; name: string };
    assist?: { id: number; name: string } | null;
}

export interface Booking {
    minute: number;
    team: { id: number; name: string };
    player: { id: number; name: string };
    card: 'YELLOW' | 'RED' | 'YELLOW_RED';
}

export interface Substitution {
    minute: number;
    team: { id: number; name: string };
    playerOut: { id: number; name: string };
    playerIn: { id: number; name: string };
}

interface Referee {
    id: number;
    name: string;
    type: string;
    nationality: string | null;
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
    homeTeam: TeamWithLineup;
    awayTeam: TeamWithLineup;
    score: Score;
    predictedScore?: PredictedScore;
    odds: Odds;
    referees: Referee[]; 
    isStarted?: boolean;
    formGuide?: {
        home: ('W' | 'D' | 'L' | 'N')[];  // 'N' = No data (gray dot)
        away: ('W' | 'D' | 'L' | 'N')[];
    };
    // Detailed match data
    goals?: Goal[];
    bookings?: Booking[];
    substitutions?: Substitution[];
    venue?: string;
    attendance?: number;
    minute?: number;
    injuryTime?: number;
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
    name: string;
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

export interface MatchDayWithStatus {
    matchDay: number;
    status: 'PAST' | 'NEXT' | 'FUTURE';
}