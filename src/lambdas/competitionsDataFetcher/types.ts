// Basic entities
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
    winner: TeamDetail | string | null;
    stages?: string[];
}

interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

interface Player {
    id: number;
    name: string;
    position: string;
    dateOfBirth: string;
    nationality: string;
}

// Match Details
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

// Match Events & Lineups
interface Substitution {
    minute: number;
    team: { id: number; name: string };
    playerOut: { id: number; name: string };
    playerIn: { id: number; name: string };
}

interface Card {
    minute: number;
    team: { id: number; name: string };
    player: { id: number; name: string };
    card: 'YELLOW' | 'RED' | 'YELLOW_RED';
}

interface Goal {
    minute: number;
    injuryTime: number | null;
    type: string;
    team: { id: number; name: string };
    scorer: { id: number; name: string };
    assist: { id: number; name: string } | null;
    score: { home: number; away: number };
}

interface LineupPlayer extends Player {
    shirtNumber: number;
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
    odds: Odds;
    referees: { id: number; name: string; type: string; nationality: string | null }[];
    // Detailed data (available in paid tier / detailed response)
    lineup?: {
        home: LineupPlayer[];
        away: LineupPlayer[];
    };
    bench?: {
        home: LineupPlayer[];
        away: LineupPlayer[];
    };
    goals?: Goal[];
    bookings?: Card[];
    substitutions?: Substitution[];
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

// Responses
export interface MatchesResponse {
    filters: Filters;
    resultSet: ResultSet;
    competition: Competition;
    matches: Match[];
}

// Standings
interface TableRow {
    position: number;
    team: Team;
    playedGames: number;
    form: string | null;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

interface Standing {
    stage: string;
    type: string;
    group: string | null;
    table: TableRow[];
}

export interface StandingsResponse {
    filters: Filters;
    area: Area;
    competition: Competition;
    season: Season;
    standings: Standing[];
}

// Top Scorers
interface Scorer {
    player: Player;
    team: Team;
    playedMatches: number;
    goals: number;
    assists: number | null;
    penalties: number | null;
}

export interface ScorersResponse {
    count: number;
    filters: Filters;
    competition: Competition;
    season: Season;
    scorers: Scorer[];
}

// Squads / Teams
export interface SquadPlayer extends Player {
    dateOfBirth: string;
    nationality: string;
    shirtNumber: number | null;
}

interface TeamDetail extends Team {
    area: Area;
    address: string;
    website: string;
    founded: number;
    clubColors: string;
    venue: string;
    coach: {
        id: number;
        firstName: string;
        lastName: string;
        name: string;
        dateOfBirth: string;
        nationality: string;
        contract: { start: string; until: string };
    };
    squad: SquadPlayer[];
    staff: { id: number; name: string; position: string }[];
    lastUpdated: string;
}

export interface TeamsResponse {
    count: number;
    filters: Filters;
    competition: Competition;
    season: Season;
    teams: TeamDetail[];
}

// Full Competition Details Response (from /competitions/{id})

export interface CompetitionDetailsResponse {
    area: Area;
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
    currentSeason: Season;
    seasons: Season[];
    lastUpdated: string;
}

// Person / Player Details Response (from /persons/{id})
export interface PersonResponse {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationality: string;
    position: string;
    shirtNumber: number | null;
    lastUpdated: string;
    currentTeam: {
        area: Area;
        id: number;
        name: string;
        shortName: string;
        tla: string;
        crest: string;
        address: string;
        website: string;
        founded: number;
        clubColors: string;
        venue: string;
        runningCompetitions: Competition[];
        contract: { start: string; until: string };
    };
}

// Extended Team Detail with market value and contracts (from /teams/{id})
export interface TeamDetailExtended extends TeamDetail {
    marketValue: number | null;
    runningCompetitions: Competition[];
}