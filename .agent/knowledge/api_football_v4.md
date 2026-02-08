# Football-Data.org API v4 Knowledge Base

This document serves as a reference for the agent and developers regarding the integration with [football-data.org](https://www.football-data.org/) v4 API.

**Official Docs**: https://docs.football-data.org/general/v4/resources.html

## Base URL
`https://api.football-data.org/v4/`

## Authentication
- **Header**: `X-Auth-Token: <YOUR_API_KEY>`
- **Tier**: Paid (Supports detailed match data, lineups, etc.)

## URI Conventions

- **Resources & subresources**: lowercase, plural (e.g., `/v4/teams`, `/v4/persons/{id}/matches`)
- **Filters (query params)**: camelCase (e.g., `dateFrom`, `matchday`)
- **Enums**: UPPERCASE (e.g., `FINISHED`, `PENALTY_SHOOTOUT`)
- Single resources are accessed by appending the ID: `/v4/teams/19`

## Request Headers

### Authentication
| Header | Description |
| :--- | :--- |
| `X-Auth-Token` | Your API key |

### X-Unfold Headers (match list requests only)

By default, match list responses **fold** (hide) deep information to reduce payload size. Use these headers to unfold specific sections:

| Header | Values | Purpose |
| :--- | :--- | :--- |
| `X-Unfold-Lineups` | `true` / `false` | Include lineup and bench arrays per team |
| `X-Unfold-Bookings` | `true` / `false` | Include bookings (cards) array |
| `X-Unfold-Subs` | `true` / `false` | Include substitutions array |
| `X-Unfold-Goals` | `true` / `false` | Include goals array |

> **Note**: When fetching a single match (`/v4/matches/{id}`), all data is included by default. The unfold headers only apply to list endpoints like `/competitions/{id}/matches`, `/teams/{id}/matches`, and `/persons/{id}/matches`.

## Response Headers

| Header | Description |
| :--- | :--- |
| `X-RequestsAvailable` | Number of API requests remaining in the current window |
| `X-RequestCounter-Reset` | Seconds until the request counter resets |
| `X-API-Version` | API version used for the request |

## Rate Limiting

| Tier | Limit |
| :--- | :--- |
| Non-authenticated | 100 requests / 24 hours (area & competition lists only) |
| Free (authenticated) | 10 requests / minute |
| Standard | 30 requests / minute |
| Premium | 60 requests / minute |

Use `X-RequestsAvailable` and `X-RequestCounter-Reset` response headers to monitor usage.

## Key Competitions
- **Premier League**: 2021
- **Champions League**: 2001
- **FIFA World Cup**: 2000
- *(Add others as needed)*

## Endpoints & Data Structures

### 1. Competition Details
- **Endpoint**: `/competitions/{id}`
- **Purpose**: Get full competition metadata and seasons history.
- **Key Data**:
    - `area`: Country/region information.
    - `currentSeason`: Current season with matchday info.
    - `seasons`: Array of all historical seasons with winners.
    - `type`: `LEAGUE`, `CUP`, `LEAGUE_CUP`, or `PLAYOFFS`.
    - `emblem`: Competition logo URL.

#### Season Object
- `id`, `startDate`, `endDate`
- `currentMatchday`: Current round/week number
- `winner`: Team object (null if season ongoing)
- `stages`: Array of competition phases — e.g., `REGULAR_SEASON`, `GROUP_STAGE`, `QUARTER_FINALS`, `SEMI_FINALS`, `FINAL`

#### Competition Subresources

| Subresource | Endpoint | Key Filters |
| :--- | :--- | :--- |
| Matches | `/competitions/{id}/matches` | `season`, `matchday`, `status`, `dateFrom`, `dateTo`, `stage`, `group` |
| Standings | `/competitions/{id}/standings` | `season`, `matchday`, `date` |
| Scorers | `/competitions/{id}/scorers` | `season`, `matchday`, `limit` |
| Teams | `/competitions/{id}/teams` | `season` |

#### Standing Types
- **TOTAL** — overall season standings
- **HOME** — home match performance only
- **AWAY** — away match performance only

> CUP and PLAYOFFS competitions return 404 for standings. LEAGUE_CUP returns one standing per group.

### 2. Matches / Fixtures
- **Endpoint**: `/v4/matches/{id}` — single match with full detail
- **List endpoints**: `/competitions/{id}/matches`, `/teams/{id}/matches`, `/persons/{id}/matches`
- **Purpose**: Get schedule, results, live scores.

#### Match Status Enum
| Status | Description |
| :--- | :--- |
| `SCHEDULED` | Match date set, kickoff time TBD |
| `TIMED` | Match date and kickoff time confirmed |
| `IN_PLAY` | Match is in progress |
| `PAUSED` | Match is paused (e.g., half-time) |
| `EXTRA_TIME` | Match is in extra time |
| `PENALTY_SHOOTOUT` | Match is in penalty shootout |
| `FINISHED` | Match has ended |
| `SUSPENDED` | Match suspended (to be resumed later) |
| `POSTPONED` | Match postponed (to be rescheduled) |
| `CANCELLED` | Match cancelled |
| `AWARDED` | Result awarded (e.g., by governing body) |

> **`LIVE`** is a pseudo-status for filtering only — it combines `IN_PLAY` + `PAUSED`. It is not returned as a match status.

#### Score Object
- `winner`: `HOME_TEAM`, `AWAY_TEAM`, `DRAW`, or `null`
- `duration`: `REGULAR`, `EXTRA_TIME`, or `PENALTY_SHOOTOUT`
- `fullTime`: Running/final score — updates during play
- `halfTime`: Set when status changes to `PAUSED`; unchanged thereafter
- `regularTime`: Goals scored after 90 minutes (available in v4+)
- `extraTime`: Goals scored only within extra time (set to 0 when `duration` becomes `EXTRA_TIME`, counts up)
- `penalties`: Goals scored only within the penalty shootout

#### Match Filters
| Filter | Format | Example |
| :--- | :--- | :--- |
| `ids` | Comma-separated integers | `/?ids=333,3303` |
| `date` | `yyyy-MM-dd` | `/?date=2022-01-01` |
| `dateFrom` | `yyyy-MM-dd` | Used with `dateTo` |
| `dateTo` | `yyyy-MM-dd` | `/?dateTo=2022-01-10` |
| `status` | Status enum | `/?status=FINISHED` |

#### Match Attributes
- `area`, `competition`, `season`, `id`, `utcDate`, `status`, `minute`, `injuryTime`
- `attendance`, `venue`, `matchday`, `stage`, `group`, `lastUpdated`
- `homeTeam` / `awayTeam`: Contains `lineup`, `bench`, `formation`, `coach`, `statistics`, `leagueRank`
- `score`: See Score Object above
- `goals`: Array of goals with `scorer`, `assist`, `minute`, `type`, `team`, running score
- `bookings`: Array of cards (`YELLOW`, `YELLOW_RED`, `RED`)
- `substitutions`: Array with `playerIn`, `playerOut`, `minute`
- `penalties`: Penalty shootout details (type: `MATCH` or `SHOOTOUT`)
- `odds`: `{ homeWin, draw, awayWin }`
- `referees`: List of officials (roles: `REFEREE`, `ASSISTANT_REFEREE_N1`–`N3`, `FOURTH_OFFICIAL`, `VIDEO_ASSISTANT_REFEREE_N1`–`N3`)

#### Team Statistics (per team in match response)
| Field | Description |
| :--- | :--- |
| `corner_kicks` | Corner kicks taken |
| `free_kicks` | Free kicks awarded |
| `goal_kicks` | Goal kicks taken |
| `offsides` | Offside calls |
| `fouls` | Fouls committed |
| `ball_possession` | Possession percentage |
| `saves` | Goalkeeper saves |
| `throw_ins` | Throw-ins taken |
| `shots` | Total shots |
| `shots_on_goal` | Shots on target |
| `shots_off_goal` | Shots off target |
| `yellow_cards` | Yellow cards |
| `yellow_red_cards` | Second yellow cards |
| `red_cards` | Red cards |

#### Head-to-Head Subresource
- **Endpoint**: `/v4/matches/{id}/head2head`
- **Purpose**: Former encounters between the two teams in the match
- Returns historical match data for both teams

#### Stage Enum
`FINAL`, `THIRD_PLACE`, `SEMI_FINALS`, `QUARTER_FINALS`, `LAST_16`, `LAST_32`, `LAST_64`, `ROUND_1`, `ROUND_2`, `ROUND_3`, `ROUND_4`, `GROUP_STAGE`, `REGULAR_SEASON`, `PLAYOFFS`, `APERTURA`, `CLAUSURA`

#### Group Enum
`GROUP_A` through `GROUP_L`

### 3. Standings (League Tables)
- **Endpoint**: `/competitions/{id}/standings`
- **Purpose**: Current league table.
- **Key Data**:
    - `standings[0].table`: Array of team positions.
    - `position`, `team`, `playedGames`, `won`, `draw`, `lost`, `points`, `goalsFor`, `goalsAgainst`, `goalDifference`, `form`.

### 4. Top Scorers
- **Endpoint**: `/competitions/{id}/scorers`
- **Purpose**: List of top goal scorers.
- **Key Data**:
    - `scorers`: Array of players with goal counts.
    - `player`: id, name, nationality, position, dateOfBirth.
    - `team`: Current team.
    - `goals`, `assists`, `penalties`, `playedMatches`.

### 5. Teams & Squads
- **Endpoint**: `/competitions/{id}/teams`
- **Purpose**: List of teams in the competition and their full squads.
- **Key Data**:
    - `teams`: Array of team objects.
    - `area`, `address`, `website`, `founded`, `clubColors`, `venue`.
    - `squad`: Array of players with `id`, `name`, `firstName`, `lastName`, `position`, `dateOfBirth`, `nationality`, `shirtNumber`, `marketValue`, `contract`.
    - `coach`: Full coach details with contract.
    - `staff`: Array of non-playing staff.
    - `runningCompetitions`: Competitions the team is currently participating in.
    - `marketValue`: Total team market value.

### 6. Individual Team
- **Endpoint**: `/teams/{id}`
- **Purpose**: Get detailed information about a specific team.
- **Key Data**: Same as teams endpoint but for a single team.
- **Type**: `CLUB` or `NATIONAL`

#### Team Matches Subresource
- **Endpoint**: `/teams/{id}/matches`
- **Purpose**: Get matches for a specific team.
- **Filters**:

| Filter | Format | Description |
| :--- | :--- | :--- |
| `dateFrom` | `yyyy-MM-dd` | Start date boundary |
| `dateTo` | `yyyy-MM-dd` | End date boundary |
| `season` | Integer (e.g., 2021) | Filter by season year |
| `status` | Status enum | Filter by match status |
| `venue` | `HOME` \| `AWAY` | Filter by match location |
| `limit` | Integer 1–500 (default: 100) | Constrain result count |

- **Response**: Includes `resultSet` with aggregate stats: total count, competitions, date range, wins, draws, losses.

### 7. Person / Player
- **Endpoint**: `/persons/{id}`
- **Purpose**: Get detailed player information.
- **Note**: 79% of persons in the database are players; it also covers referees and staff.
- **Key Data**:
    - `id`, `name`, `firstName`, `lastName`.
    - `dateOfBirth`, `nationality`, `position`, `shirtNumber`.
    - `lastUpdated`
    - `currentTeam`: Full team details with contract (id, name, shortName, tla, crest, address, website, founded, clubColors, venue, runningCompetitions, contract dates).

#### Person Matches Subresource
- **Endpoint**: `/persons/{id}/matches`
- **Purpose**: Player's match history (defaults to current season, descending order).
- **Filters**:

| Filter | Format | Description |
| :--- | :--- | :--- |
| `lineup` | `STARTING` \| `BENCH` | Filter by squad role |
| `e` | `GOAL` \| `ASSIST` \| `SUB_IN` \| `SUB_OUT` | Filter by event type |
| `dateFrom` | `yyyy-MM-dd` | Start date |
| `dateTo` | `yyyy-MM-dd` | End date |
| `competitions` | Comma-separated codes | e.g., `PL,FAC` |
| `limit` | Integer 1–100 (default: 15) | Result count |
| `offset` | Integer 1–100 | Pagination offset |

- **Response**: Includes `filters`, `resultSet`, `aggregations`, `person`, and `matches` array.

#### Aggregations Object
| Field | Description |
| :--- | :--- |
| `matchesOnPitch` | Total appearances |
| `startingXI` | Starting lineup appearances |
| `minutesPlayed` | Total minutes played |
| `goals` | Goals scored |
| `ownGoals` | Own goals |
| `assists` | Assists |
| `penalties` | Penalty kicks |
| `subbedOut` | Times substituted off |
| `subbedIn` | Times substituted on |
| `yellowCards` | Yellow cards received |
| `yellowRedCards` | Second yellow cards |
| `redCards` | Red cards received |

### 8. Area
- **Endpoint**: `/areas/{id}`
- **Purpose**: Geographic area information (countries, regions).

## Error Codes

| HTTP Code | Name | Description |
| :--- | :--- | :--- |
| 400 | Bad Request | Malformed request — typically a filter value doesn't match the expected data type |
| 403 | Restricted Resource | Access denied — unauthenticated, insufficient subscription tier, or API version mismatch |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded for your plan tier |
| 500 | Server Error | Backend issue — not a client error |

Error response format:
```json
{
  "error": "Argument 'id' is expected to be an integer in a specific range."
}
```

## API Policies

- **Null values**: The API embraces `null` as a valid value for unknown/unavailable data
- **Numeric types**: Scores and counts return as integers, not strings
- **Time defaults**: Requests default to "now" in UTC; team squad data returns current season
- **Smart requests**: Minimize requests — use filters and caching rather than polling or crawling sequential IDs

## Lookup Tables (Quick Reference)

| Category | Values |
| :--- | :--- |
| **Match Status** | `SCHEDULED`, `TIMED`, `IN_PLAY`, `PAUSED`, `EXTRA_TIME`, `PENALTY_SHOOTOUT`, `FINISHED`, `SUSPENDED`, `POSTPONED`, `CANCELLED`, `AWARDED` |
| **Competition Type** | `LEAGUE`, `CUP`, `LEAGUE_CUP`, `PLAYOFFS` |
| **Score Duration** | `REGULAR`, `EXTRA_TIME`, `PENALTY_SHOOTOUT` |
| **Card Type** | `YELLOW`, `YELLOW_RED`, `RED` |
| **Goal Type** | `REGULAR`, `OWN`, `PENALTY` |
| **Penalty Type** | `MATCH`, `SHOOTOUT` |
| **Team Type** | `CLUB`, `NATIONAL` |
| **Standing Type** | `TOTAL`, `HOME`, `AWAY` |

## Database Schema (DynamoDB)

### Competition-level data (PartitionKey = `COMPETITION_ID#{id}`)

| Data Type | SortKey Pattern | Content |
| :--- | :--- | :--- |
| **Helper/Meta** | `HELPER` | Active season, matchdays array, general metadata. |
| **Competition Details** | `COMPETITION_DETAILS` | Full competition info with all seasons history. |
| **Matches** | `SEASON#{season}#MATCHDAY#{day}` | Lists of matches for that specific day. |
| **Standings** | `SEASON#{season}#STANDINGS` | Full standings object. |
| **Scorers** | `SEASON#{season}#SCORERS` | List of top scorers. |
| **Teams** | `SEASON#{season}#TEAMS` | List of all teams with full squad data. |

### Team-level data (PartitionKey = `TEAM_ID#{id}`)

| Data Type | SortKey Pattern | Content |
| :--- | :--- | :--- |
| **Team Season** | `SEASON#{season}` | Full team details with squad for that season. |

## Best Practices
- **Rate Limiting**: Be mindful of request limits (though higher on paid plan). Use 500ms-1s delays between competitions.
- **Caching**: Store data in DynamoDB to minimize API calls (e.g., fetch hourly).
- **Updates**: Use `lastUpdated` fields to only process changes if necessary (optimization).
- **Individual Team Storage**: Store teams both at competition level and individually for quick lookups.

## Implementation Advice & Use Cases

### 1. Live Scores & Fixtures
- **Frequency**: For live matches, poll the `matches` endpoint every 1-5 minutes.
- **Display**:
    - Show `status` (e.g., 'IN_PLAY', 'PAUSED', 'HT') prominently.
    - Animate score changes or flash the changed value.
    - Use `utcDate` to group fixtures by day (as decided in our DB structure).
    - Show `minute` and `injuryTime` for in-progress matches.

### 2. Line-ups & Subs
- **Data Source**: `homeTeam.lineup`, `homeTeam.bench`, `awayTeam.lineup`, `awayTeam.bench` in match response.
- **UI Presentation**:
    - **Pitch View**: Visual representation of formations (e.g., 4-4-2) using `formation` field.
    - **List View**: Separate 'Starting XI' and 'Substitutes'.
    - **Subs**: Indicate substitutions with arrows (in/out) and timestamps from `substitutions` array.

### 3. Goal Scorers (Match Events)
- **Data Source**: `goals` array in match response.
- **Usage**:
    - **Feed**: Show "Goal" events in a live match feed with minute, scorer, assist.
    - **Types**: Display penalty (`PENALTY`), own goal (`OWN_GOAL`), regular goal.
    - **Stats**: Aggregate to show "Player of the Match" or compare with `/scorers` endpoint.

### 4. Bookings / Cards
- **Data Source**: `bookings` array in match response.
- **Visuals**:
    - Yellow/Red card icons next to player names in lineups.
    - "Sent Off" indicators for teams (reduce player count on pitch view).
    - Track `YELLOW_RED` (second yellow leading to red).

### 5. Schedules
- **Planning**: Use `status: 'SCHEDULED'` or `status: 'TIMED'` to show upcoming games.
- **Calendar**: Map `utcDate` to a calendar view.
- **Notifications**: Schedule background jobs (EventBridge) to trigger notifications X minutes before kickoff.

### 6. Team & Squad Information
- **Squad View**: Display full squad with positions, shirt numbers, nationalities.
- **Player Profiles**: Link to individual player details using player IDs.
- **Market Values**: Show team and player market values (if available on paid tier).
- **Contracts**: Display contract end dates for transfer speculation.

## Files & Implementation

### Lambda (`src/lambdas/competitionsDataFetcher/matchFetcher.ts`)
- Fetches all data endpoints for configured competitions.
- Saves to DynamoDB with proper key structure.
- Saves teams both at competition level AND individually.

### Local Script (`scripts/update-local-dynamodb.ts`)
- Same functionality as Lambda but for local DynamoDB.
- Run with: `bun run update-dynamodb`

### Types (`src/lambdas/competitionsDataFetcher/types.ts`)
- TypeScript interfaces for all API responses.
- `MatchesResponse`, `StandingsResponse`, `ScorersResponse`, `TeamsResponse`, `CompetitionDetailsResponse`, `PersonResponse`.
