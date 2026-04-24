-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "StandingTableType" AS ENUM ('TOTAL', 'HOME', 'AWAY');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "profile_image" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" INTEGER NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "emblem_url" TEXT,
    "current_matchday" INTEGER,
    "active_season_id" UUID,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "short_name" VARCHAR(64),
    "tla" VARCHAR(8),
    "crest_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "position" VARCHAR(32),
    "nationality" VARCHAR(64),
    "date_of_birth" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "season_id" UUID NOT NULL,
    "matchday" INTEGER,
    "stage" VARCHAR(64),
    "home_team_id" INTEGER NOT NULL,
    "away_team_id" INTEGER NOT NULL,
    "utc_date" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL,
    "home_score_ft" INTEGER,
    "away_score_ft" INTEGER,
    "home_score_ht" INTEGER,
    "away_score_ht" INTEGER,
    "raw_data" JSONB,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_predictions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "match_id" INTEGER NOT NULL,
    "home_score" INTEGER NOT NULL,
    "away_score" INTEGER NOT NULL,
    "points_awarded" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" UUID NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "season_id" UUID NOT NULL,
    "table_type" "StandingTableType" NOT NULL,
    "position" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "draw" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "goals_for" INTEGER NOT NULL,
    "goals_against" INTEGER NOT NULL,
    "goal_difference" INTEGER NOT NULL,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "top_scorers" (
    "id" UUID NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "season_id" UUID NOT NULL,
    "team_id" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL,
    "assists" INTEGER,
    "penalties" INTEGER,
    "played_matches" INTEGER,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "top_scorers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_deleted_idx" ON "users"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_code_key" ON "competitions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_competition_id_year_key" ON "seasons"("competition_id", "year");

-- CreateIndex
CREATE INDEX "matches_competition_id_season_id_matchday_idx" ON "matches"("competition_id", "season_id", "matchday");

-- CreateIndex
CREATE INDEX "matches_status_utc_date_idx" ON "matches"("status", "utc_date");

-- CreateIndex
CREATE INDEX "matches_utc_date_idx" ON "matches"("utc_date");

-- CreateIndex
CREATE INDEX "user_predictions_user_id_points_awarded_idx" ON "user_predictions"("user_id", "points_awarded");

-- CreateIndex
CREATE INDEX "user_predictions_match_id_idx" ON "user_predictions"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_predictions_user_id_match_id_key" ON "user_predictions"("user_id", "match_id");

-- CreateIndex
CREATE INDEX "standings_competition_id_season_id_table_type_position_idx" ON "standings"("competition_id", "season_id", "table_type", "position");

-- CreateIndex
CREATE UNIQUE INDEX "standings_competition_id_season_id_table_type_team_id_key" ON "standings"("competition_id", "season_id", "table_type", "team_id");

-- CreateIndex
CREATE INDEX "top_scorers_competition_id_season_id_goals_idx" ON "top_scorers"("competition_id", "season_id", "goals" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "top_scorers_competition_id_season_id_player_id_key" ON "top_scorers"("competition_id", "season_id", "player_id");

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_active_season_id_fkey" FOREIGN KEY ("active_season_id") REFERENCES "seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_scorers" ADD CONSTRAINT "top_scorers_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

