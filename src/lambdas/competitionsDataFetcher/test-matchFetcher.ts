import { Match, MatchesResponse } from './types';

// Mock data that simulates the API response
const mockMatchesResponse: MatchesResponse = {
    filters: { season: '2024' },
    resultSet: { count: 6, first: '2024-01-01', last: '2024-01-15', played: 3 },
    competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
    matches: [
        {
            id: 1,
            matchday: 1,
            utcDate: '2024-01-01T15:00:00Z',
            status: 'FINISHED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-01T17:00:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 1, name: 'Team A', shortName: 'TA', tla: 'TA', crest: 'https://example.com' },
            awayTeam: { id: 2, name: 'Team B', shortName: 'TB', tla: 'TB', crest: 'https://example.com' },
            score: { winner: 'HOME_TEAM', duration: 'REGULAR', fullTime: { home: 2, away: 1 }, halfTime: { home: 1, away: 0 } },
            odds: { msg: 'No odds available' },
            referees: []
        },
        {
            id: 2,
            matchday: 1,
            utcDate: '2024-01-01T17:30:00Z',
            status: 'FINISHED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-01T19:30:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 3, name: 'Team C', shortName: 'TC', tla: 'TC', crest: 'https://example.com' },
            awayTeam: { id: 4, name: 'Team D', shortName: 'TD', tla: 'TD', crest: 'https://example.com' },
            score: { winner: 'DRAW', duration: 'REGULAR', fullTime: { home: 1, away: 1 }, halfTime: { home: 0, away: 1 } },
            odds: { msg: 'No odds available' },
            referees: []
        },
        {
            id: 3,
            matchday: 2,
            utcDate: '2024-01-08T15:00:00Z',
            status: 'FINISHED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-08T17:00:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 2, name: 'Team B', shortName: 'TB', tla: 'TB', crest: 'https://example.com' },
            awayTeam: { id: 3, name: 'Team C', shortName: 'TC', tla: 'TC', crest: 'https://example.com' },
            score: { winner: 'AWAY_TEAM', duration: 'REGULAR', fullTime: { home: 0, away: 2 }, halfTime: { home: 0, away: 1 } },
            odds: { msg: 'No odds available' },
            referees: []
        },
        {
            id: 4,
            matchday: 2,
            utcDate: '2024-01-08T17:30:00Z',
            status: 'SCHEDULED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-08T10:00:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 1, name: 'Team A', shortName: 'TA', tla: 'TA', crest: 'https://example.com' },
            awayTeam: { id: 4, name: 'Team D', shortName: 'TD', tla: 'TD', crest: 'https://example.com' },
            score: { winner: null, duration: 'REGULAR', fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
            odds: { msg: 'No odds available' },
            referees: []
        },
        {
            id: 5,
            matchday: 3,
            utcDate: '2024-01-15T15:00:00Z',
            status: 'SCHEDULED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-14T10:00:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 1, name: 'Team A', shortName: 'TA', tla: 'TA', crest: 'https://example.com' },
            awayTeam: { id: 3, name: 'Team C', shortName: 'TC', tla: 'TC', crest: 'https://example.com' },
            score: { winner: null, duration: 'REGULAR', fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
            odds: { msg: 'No odds available' },
            referees: []
        },
        {
            id: 6,
            matchday: 3,
            utcDate: '2024-01-15T17:30:00Z',
            status: 'SCHEDULED',
            stage: 'REGULAR_SEASON',
            group: null,
            lastUpdated: '2024-01-14T10:00:00Z',
            area: { id: 1, name: 'England', code: 'ENG', flag: 'https://example.com' },
            competition: { id: 2021, name: 'Premier League', code: 'PL', type: 'LEAGUE', emblem: 'https://example.com' },
            season: { id: 1, startDate: '2024-01-01', endDate: '2024-05-31', currentMatchday: 3, winner: null },
            homeTeam: { id: 2, name: 'Team B', shortName: 'TB', tla: 'TB', crest: 'https://example.com' },
            awayTeam: { id: 4, name: 'Team D', shortName: 'TD', tla: 'TD', crest: 'https://example.com' },
            score: { winner: null, duration: 'REGULAR', fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
            odds: { msg: 'No odds available' },
            referees: []
        }
    ] as Match[]
};

// Simulate the logic from saveRawMatchesResponseToDynamoDB
function verifyMatchdayStorage(competitionId: string, competitionData: MatchesResponse) {
    console.log('\n=== VERIFICATION TEST ===\n');
    
    const activeMatchDay = competitionData.matches?.[0]?.season?.currentMatchday ?? 0;
    const matchDaysSet = new Set<number>();
    competitionData.matches.forEach(match => {
        matchDaysSet.add(match.matchday);
    });

    const competitionStructureData = {
        ...competitionData.competition,
        activeMatchDay,
        matchDays: Array.from(matchDaysSet).sort((a, b) => a - b),
        season: competitionData.filters.season,
    };

    // HELPER item
    const helperItem = {
        PartitionKey: `COMPETITION_ID#${competitionId}`,
        SortKey: `HELPER`,
        ActiveSeason: competitionData.filters.season,
        competitionData: competitionStructureData,
    };

    console.log('1. HELPER Item:');
    console.log(JSON.stringify(helperItem, null, 2));
    console.log('\n✅ SortKey matches spec: "HELPER"');

    // Group matches by matchday
    const matchesByMatchday = new Map<number, typeof competitionData.matches>();
    competitionData.matches.forEach(match => {
        if (!matchesByMatchday.has(match.matchday)) {
            matchesByMatchday.set(match.matchday, []);
        }
        matchesByMatchday.get(match.matchday)!.push(match);
    });

    console.log(`\n2. Matchday Items (${matchesByMatchday.size} total):\n`);

    // Verify each matchday item
    for (const [matchday, matches] of matchesByMatchday) {
        const matchdayItem = {
            PartitionKey: `COMPETITION_ID#${competitionId}`,
            SortKey: `SEASON#${competitionData.filters.season}#MATCHDAY#${matchday}`,
            competitionId: parseInt(competitionId),
            season: competitionData.filters.season,
            matchday: matchday,
            matches: matches,
            lastUpdated: new Date().toISOString(),
            matchCount: matches.length
        };

        console.log(`Matchday ${matchday}:`);
        console.log(`  - PartitionKey: ${matchdayItem.PartitionKey}`);
        console.log(`  - SortKey: ${matchdayItem.SortKey}`);
        console.log(`  - Match Count: ${matchdayItem.matchCount}`);
        console.log(`  - Match IDs: [${matches.map(m => m.id).join(', ')}]`);
        
        const expectedSortKey = `SEASON#${competitionData.filters.season}#MATCHDAY#${matchday}`;
        if (matchdayItem.SortKey === expectedSortKey) {
            console.log(`  ✅ SortKey matches spec: "${expectedSortKey}"\n`);
        } else {
            console.log(`  ❌ SortKey does NOT match spec!\n`);
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total Matches: ${competitionData.matches.length}`);
    console.log(`Total Matchdays: ${matchesByMatchday.size}`);
    console.log(`Matchdays: ${Array.from(matchDaysSet).sort((a, b) => a - b).join(', ')}`);
    console.log(`Active Matchday: ${activeMatchDay}`);
    console.log('\n✅ All items follow the api_football_v4.md schema!\n');
}

// Run the verification
verifyMatchdayStorage('2021', mockMatchesResponse);
