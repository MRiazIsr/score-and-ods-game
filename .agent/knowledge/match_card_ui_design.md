# Match Card UI Design Documentation

This document outlines the design and implementation of the Match Card system, including the main card display and the detailed match modal.

## Overview
The Match Card UI is designed to provide a quick summary of match status, predictions, and recent form, while allowing users to deep-dive into details via a modal.

## Component Architecture

### 1. `MatchCard` (`src/components/match-card.tsx`)
The primary entry point for match display.
- **Header**: Shows date/time and status. Contains the **"Additional Info"** button (styled with `text-blue-500`) which triggers the modal.
- **Form Guide**: Displayed below team names as a row of 5 small colored dots (Green = Win, Yellow = Draw, Red = Loss).
- **Scores/Predictions**: Shows the user's prediction inputs in the center. If the match is live or finished, actual scores appear prominently.
- **Live Indicator**: Uses a pulsing red dot and "LIVE" text when match status is `IN_PLAY` or `PAUSED`.

### 2. `MatchDetailsModal` (`src/components/match-details-modal.tsx`)
A full-screen/large modal providing a comprehensive view of a single match.
- **Scoreboard**: Large team crests and names with score tracking.
- **Recent Form Card**: Displays a detailed W/D/L badge row for both teams (Last 5 matches).
- **Prediction Card**: Large display of the user's predicted score vs. others.
- **Stats Placeholder**: A dedicated area for future implementation of lineups, match events, and advanced statistics.

## Data Logic

### Form Guide Calculation
Form is calculated on the server side in `DynamoDbCompetitionsManager.ts` inside the `getAllMatchesWithPredictions` method.
- **Logic**: It filters the last 5 `FINISHED` matches for a team that occurred before the `utcDate` of the current match.
- **Result**: An array of `('W' | 'D' | 'L')[]` is attached to the `Match` object under the `formGuide` property.

### Types
Key interfaces in `src/app/server/modules/competitions/types.ts`:
- `Match`: Extended to include `formGuide` and `predictedScore`.
- `Team`: Exported for use in frontend components.
- `PredictedScore`: Tracks the home/away scores and the `isPredicted` boolean state.

## Design Aesthetics
- **Colors**: Uses Shadcn-like tokens (`bg-muted`, `bg-card`, `border-border`).
- **Typography**: Mono fonts for scores and status codes (e.g., `FINISHED`, `IN_PLAY`).
- **Interactions**:
    - "Additional Info" button uses a ghost variant with blue text for high visibility without being overwhelming.
    - Modal uses `backdrop-blur-sm` for focus.

## Future Extension Points
- **Lineups**: The `MatchDetailsModal` has a placeholder section ready for `LineupPlayer[]` data matching the recently updated `types.ts` in the lambda layer.
- **Events**: Goal scorers, bookings, and substitutions should be integrated into the modal's scrollable content area.
- **Head-to-Head**: A potential new section for the modal comparing the two teams' history.

## Relevant Files
- `src/components/match-card.tsx`: Main UI.
- `src/components/match-details-modal.tsx`: Detailed UI.
- `src/app/server/modules/competitions/DynamoDbCompetitionsManager/DynamoDbCompetitionsManager.ts`: Form logic.
- `src/app/server/modules/competitions/types.ts`: Core data structures.
