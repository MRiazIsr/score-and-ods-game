import type { DbUser, SessionUser, User } from "@/app/server/modules/user/types/userTypes";

export interface IUserManager {
    createUser(user: User): Promise<SessionUser>;
    getUserIdByUserName(userName: string): Promise<string | undefined>;
    getUserDataById(userId: string): Promise<DbUser>;
}
