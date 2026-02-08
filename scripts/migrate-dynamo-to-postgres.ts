import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import db from '../src/lib/db'; // Running via bun, allowing import of src files if configured correctly, else we might need relative path adjustment or run with tsx

// Configuration
const DYNAMO_TABLE_NAME = process.env.TABLE_NAME || 'SoccerGameData';
const DYNAMO_ENDPOINT = 'http://localhost:8000'; // Local DynamoDB container
const DYNAMO_REGION = 'eu-central-1';

const dynamoClient = new DynamoDBClient({
    region: DYNAMO_REGION,
    endpoint: DYNAMO_ENDPOINT,
    credentials: {
        accessKeyId: 'fake',
        secretAccessKey: 'fake'
    }
});

async function migrate() {
    console.log('Starting migration...');
    console.log(`Reading from DynamoDB table: ${DYNAMO_TABLE_NAME} at ${DYNAMO_ENDPOINT}`);

    try {
        let items: any[] = [];
        let lastEvaluatedKey: any = undefined;

        // 1. Scan entire DynamoDB table
        do {
            const command = new ScanCommand({
                TableName: DYNAMO_TABLE_NAME,
                ExclusiveStartKey: lastEvaluatedKey
            });
            const response = await dynamoClient.send(command);
            if (response.Items) {
                const unmarshalledItems = response.Items.map(item => unmarshall(item));
                items = items.concat(unmarshalledItems);
            }
            lastEvaluatedKey = response.LastEvaluatedKey;
            console.log(`Scanned ${items.length} items so far...`);
        } while (lastEvaluatedKey);

        console.log(`Total items found: ${items.length}`);

        // 2. Separate Items by Type
        const users: any[] = [];
        const matches: any[] = [];
        const predictions: any[] = [];
        const competitions: any[] = [];
        const matchLookup: Record<string, any> = {};

        for (const item of items) {
            const pk = item.PartitionKey;
            const sk = item.SortKey;

            if (pk && pk.startsWith('USERID#')) {
                // User Details
                users.push(item);
            } else if (pk && pk.startsWith('COMPETITION_ID#') && sk && sk.startsWith('MATCHES_DATA#')) {
                // Matches Data (Bulk)
                if (item.rawData && item.rawData.matches) {
                    for (const m of item.rawData.matches) {
                        matches.push({
                            ...m,
                            competitionId: item.competitionId?.toString()
                        });
                        // m.id is the external match id
                        matchLookup[m.id] = { ...m, competitionId: item.competitionId?.toString() }; 
                    }
                }
            } else if (pk && pk.startsWith('COMPETITION_ID#') && sk === 'HELPER') {
                 if (item.competitionData) {
                     competitions.push(item.competitionData);
                 }
            } else if (pk && pk.startsWith('USER#') && sk && sk.includes('MATCH#')) {
                // Prediction (Match Score)
                // SK format: COMPETITION_ID#...MATCH_DAY#...MATCH#<MatchID>
                predictions.push(item);
            }
        }

        console.log(`Found ${users.length} users.`);
        console.log(`Found ${Object.keys(matchLookup).length} unique matches.`);
        console.log(`Found ${predictions.length} predictions.`);

        // 3. Migrate Users
        console.log('Migrating Users...');
        for (const u of users) {
             const userId = u.userId || u.PartitionKey.replace('USERID#', '');
             // Ensure optional fields are handled
             await db.user.upsert({
                 where: { username: u.userName }, // Assuming username is unique
                 update: {
                     email: u.email,
                     password: u.password, // Keep existing hashed password
                     name: u.name,
                 },
                 create: {
                     id: userId,
                     username: u.userName,
                     email: u.email,
                     password: u.password,
                     salt: u.salt,
                     name: u.name,
                     // salt? We might need to handle this if existing auth relies on it. 
                     // Postgres schema stores password. I assume it includes salt logic or is just the hash.
                     // The new auth system should be compatible or adapted.
                 }
             });
        }
        console.log('Users migrated.');

        // 4. Migrate Competitions
        console.log('Migrating Competitions...');
        for (const c of competitions) {
            await db.competition.upsert({
                where: { id: c.id.toString() },
                update: {
                    name: c.name,
                    code: c.code,
                    emblem: c.emblem,
                    type: c.type,
                    activeSeason: c.activeMatchDay ? parseInt(c.season) : (c.season || 2024), // Helper data structure varies?
                    // Dynamo Helper Item: { ... competitionData.competition, activeMatchDay, season ... }
                    // item in competitions list is `item.competitionData`.
                    // In scan logic: `competitions.push(item.competitionData)`.
                    // item.competitionData structure in `matchFetcher.ts`: 
                    // { ...competitionData.competition (id, name, ...), activeMatchDay, matchDays, season }
                    // So `c.season` exists.
                },
                create: {
                    id: c.id.toString(),
                    name: c.name,
                    code: c.code,
                    emblem: c.emblem,
                    type: c.type,
                    activeSeason: c.season, 
                }
            });
        }
        console.log('Competitions migrated.');

        // 5. Migrate Matches
        console.log('Migrating Matches...');
        for (const mId in matchLookup) {
            const m = matchLookup[mId];
            const matchIdStr = m.id.toString();
            
            // Map status
            const status = m.status; 
            const startTime = new Date(m.utcDate);

            await db.match.upsert({
                where: { id: matchIdStr },
                update: {
                    status: status,
                    homeScore: m.score?.fullTime?.home ?? null,
                    awayScore: m.score?.fullTime?.away ?? null,
                },
                create: {
                    id: matchIdStr,
                    competitionId: m.competitionId || "UNKNOWN", // Should come from item
                    sportId: "soccer", // Hardcoded as existing app is soccer
                    homeTeam: m.homeTeam?.name || "Unknown Home",
                    awayTeam: m.awayTeam?.name || "Unknown Away",
                    matchDay: m.matchday,
                    status: status,
                    startTime: startTime,
                    homeScore: m.score?.fullTime?.home ?? null,
                    awayScore: m.score?.fullTime?.away ?? null,
                }
            });
        }
        console.log('Matches migrated.');

        // 6. Migrate Predictions
        console.log('Migrating Predictions...');
        for (const p of predictions) {
            const userId = p.PartitionKey.replace('USER#', '');
            const sk = p.SortKey;
            
            // Extract Match ID from SortKey
            // Example SK: COMPETITION_ID#2021SEASON#2023MATCH_DAY#1MATCH#12345
            const matchIdMatch = sk.match(/MATCH#(\d+)$/);
            if (!matchIdMatch) continue;
            
            const matchId = matchIdMatch[1];

            // Verify User and Match exist (Prisma constraint)
            const userExists = await db.user.findUnique({ where: { id: userId } });
            const matchExists = await db.match.findUnique({ where: { id: matchId } });

            if (!userExists) {
                console.warn(`Skipping prediction for missing user ${userId}`);
                continue;
            }
            if (!matchExists) {
                 // Try to fetch match info from p? P only has scores.
                 // If match match wasn't in the Matches scan (e.g. competition data missing), we can't link.
                 console.warn(`Skipping prediction for missing match ${matchId}`);
                 continue;
            }

            await db.prediction.upsert({
                where: {
                    userId_matchId: {
                        userId: userId,
                        matchId: matchId
                    }
                },
                update: {
                    homeScore: p.homeScore,
                    awayScore: p.awayScore
                },
                create: {
                    userId: userId,
                    matchId: matchId,
                    homeScore: p.homeScore,
                    awayScore: p.awayScore
                }
            });
        }
        console.log('Predictions migrated.');
        console.log('Migration Complete.');

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await db.$disconnect();
    }
}

migrate();
