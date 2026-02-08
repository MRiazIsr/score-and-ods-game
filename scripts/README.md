# Scripts Directory

This directory contains utility scripts for managing the Tip Manager application.

## Available Scripts

### `update-local-dynamodb.ts`

Updates your local DynamoDB instance with the latest football data from the Football-Data.org API v4.

#### What it does:
- Fetches data for all configured competitions (Premier League, Champions League, FIFA World Cup)
- Stores the following data types in DynamoDB:
  - **Matches** - Grouped by matchday for efficient querying
  - **Standings** - Current league tables
  - **Top Scorers** - Leading goal scorers
  - **Teams & Squads** - Team rosters and player information
  - **Helper** - Competition metadata (active season, matchdays, etc.)

#### Prerequisites:
1. Local DynamoDB must be running:
   ```bash
   docker compose up -d dynamodb-local
   ```

2. Environment variables must be configured in `.env`:
   - `API_KEY` - Your Football-Data.org API key
   - `API_URL` - API base URL (defaults to `https://api.football-data.org/v4`)
   - `TABLE_NAME` - DynamoDB table name (defaults to `SocerGameData`)

#### Usage:

```bash
# Run directly
bun run scripts/update-local-dynamodb.ts

# Or use the npm script
npm run update-dynamodb

# Or with bun
bun run update-dynamodb
```

#### Output:
The script provides detailed console output showing:
- ✅ Successful operations
- ❌ Errors
- ⚠️  Warnings (e.g., when data is not available)
- 📊 Summary statistics

#### DynamoDB Schema:
Data is stored using the following pattern:

| Data Type | PartitionKey | SortKey | Description |
|-----------|--------------|---------|-------------|
| **Helper** | `COMPETITION_ID#{id}` | `HELPER` | Competition metadata, active season |
| **Matches** | `COMPETITION_ID#{id}` | `SEASON#{season}#MATCHDAY#{day}` | Matches for specific matchday |
| **Standings** | `COMPETITION_ID#{id}` | `SEASON#{season}#STANDINGS` | League table |
| **Scorers** | `COMPETITION_ID#{id}` | `SEASON#{season}#SCORERS` | Top scorers list |
| **Teams** | `COMPETITION_ID#{id}` | `SEASON#{season}#TEAMS` | Teams and squads |

#### Configuration:
To modify which competitions are fetched, edit the `CONFIG.competitions` array in the script:

```typescript
competitions: [
    { id: 2021, name: 'Premier League' },
    { id: 2001, name: 'Champions League' },
    { id: 2000, name: 'FIFA World Cup' }
]
```

#### Rate Limiting:
The script automatically waits 1 second between competitions to respect API rate limits.

#### Error Handling:
- If a competition fails, the script continues with the next one
- Final summary shows success/failure count
- Exit code 1 if any competitions failed

---

### `migrate-dynamo-to-postgres.ts`

Migrates data from DynamoDB to PostgreSQL database.

---

## Development Tips

### Viewing DynamoDB Data Locally

You can use the AWS CLI to query your local DynamoDB:

```bash
# List all tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Scan the entire table
aws dynamodb scan \
  --table-name SocerGameData \
  --endpoint-url http://localhost:8000

# Query specific competition
aws dynamodb query \
  --table-name SocerGameData \
  --key-condition-expression "PartitionKey = :pk" \
  --expression-attribute-values '{":pk":{"S":"COMPETITION_ID#2021"}}' \
  --endpoint-url http://localhost:8000
```

### Clearing Local DynamoDB

To reset your local database:

```bash
# Stop the container
docker compose down dynamodb-local

# Remove the data directory
rm -rf ./docker/dynamodb

# Start fresh
docker compose up -d dynamodb-local
```

Then re-run the update script to populate with fresh data.

## Adding New Scripts

When adding new scripts:
1. Create the `.ts` file in this directory
2. Add an npm script in `package.json` for easy execution
3. Document it in this README
4. Make the script executable if it's a bash script: `chmod +x script-name.sh`
