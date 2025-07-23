export class CompetitionsEntity {
    static competitionsIds = {
        ENGLISH_PREMIER_LEAGUE_ID: 2021,
        CHAMPIONS_LEAGUE_ID: 2001
    };

    static readonly competitionsIdArray = Object.values(CompetitionsEntity.competitionsIds);
}