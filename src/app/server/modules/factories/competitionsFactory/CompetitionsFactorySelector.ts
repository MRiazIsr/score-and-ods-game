import { DynamoDbCompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/DynamoDbCompetitionsFactory";

export const selectFactory = (dbType: string = ''): DynamoDbCompetitionsFactory =>
{
    switch (dbType.toLowerCase()) {
        case 'dynamo':
            return new DynamoDbCompetitionsFactory();
        default:
            throw new Error(`Unknown DB type: ${dbType}`);
    }
}