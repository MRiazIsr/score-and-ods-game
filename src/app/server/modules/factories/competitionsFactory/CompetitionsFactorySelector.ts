import { DynamoDbCompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/DynamoDbCompetitionsFactory";
import { PrismaCompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/PrismaCompetitionsFactory";
import { ICompetitionsFactory } from "@/app/server/modules/factories/competitionsFactory/ICompetitionsFactory";

export const selectFactory = (dbType: string = 'postgres'): ICompetitionsFactory =>
{
    switch (dbType.toLowerCase()) {
        case 'dynamodb':
            return new DynamoDbCompetitionsFactory();
        case 'postgres':
        default:
            return new PrismaCompetitionsFactory();
    }
}