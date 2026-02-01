
import { DynamoDbAuthFactory } from "@/app/server/modules/factories/authFactory/DynamoDbAuthFactory";
import { PrismaAuthFactory } from "@/app/server/modules/factories/authFactory/PrismaAuthFactory";
import { IAuthFactory } from "@/app/server/modules/factories/authFactory/IAuthFactory";

export const selectFactory = (dbType: string = 'postgres'): IAuthFactory =>
{
    // Hybrid architecture selected as final. Always return Prisma factory.
    return new PrismaAuthFactory();
}
