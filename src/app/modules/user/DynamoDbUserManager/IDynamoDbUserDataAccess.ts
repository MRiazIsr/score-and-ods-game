export interface IDynamoDbUserDataAccess {
    saveUserNameRowWithId(userName: string, userId: string): Promise<boolean>
    saveUser(dbUser: DbUser): Promise<boolean>
}