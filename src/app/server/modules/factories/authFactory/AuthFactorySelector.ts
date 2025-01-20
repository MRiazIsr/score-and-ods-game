
import {DynamoDbAuthFactory} from "@/app/server/modules/factories/authFactory/DynamoDbAuthFactory";

export const selectFactory = (dbType: string = ''): DynamoDbAuthFactory =>
{
    switch (dbType.toLowerCase()) {
        case 'dynamo':
            return new DynamoDbAuthFactory();
        default:
            throw new Error(`Unknown DB type: ${dbType}`);
        }
}
