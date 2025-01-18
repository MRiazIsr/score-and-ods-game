import {DynamoDbAuthFactory} from "@/app/modules/factories/authFactory/DynamoDbAuthFactory";

export const selectFactory = (dbType: string = ''): DynamoDbAuthFactory =>
{
    switch (dbType) {
        case 'dynamo':
            return new DynamoDbAuthFactory();
        default:
            throw new Error(`Unknown DB type: ${dbType}`);
        }
}
