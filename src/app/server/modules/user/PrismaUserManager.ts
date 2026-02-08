import {IUserManager} from "@/app/server/modules/user/IUserManager";
import type {DbUser, SessionUser, User} from "@/app/server/modules/user/types/userTypes";
import db from "@/lib/db";
import {UserTypeEntity} from "@/app/server/entities/UserTypesEntity";
import {Md5} from 'ts-md5';

export class PrismaUserManager implements IUserManager {
    
    public async createUser(user: User): Promise<SessionUser> {
        // Validation: Check if user exists
        const existingUser = await db.user.findFirst({
            where: {
                OR: [
                    { username: user.userName },
                    { email: user.email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === user.userName) {
                 throw new Error("User name already exists");
            }
            throw new Error("User already exists");
        }

        const salt = crypto.randomUUID();
        const hashedPassword = Md5.hashStr(user.password + salt);
        
        // 1. Create User
        // Note: Prisma will generate ID via CUID default, or we can provide UUID.
        // Existing system used UUID. Let's rely on Prisma default (CUID) for new users unless strict UUID requirement.
        // But for consistency with migrated users (UUID), maybe we should use UUID?
        // Let's stick to CUID as defined in schema.
        
        const newUser = await db.user.create({
            data: {
                name: user.name ?? '',
                email: user.email ?? '',
                username: user.userName,
                password: hashedPassword,
                salt: salt,
                // createdLeagues ...
            }
        });

        // 2. Add to Global League
        // Find Global League
        let globalLeague = await db.league.findFirst({
            where: { isGlobal: true }
        });

        // If not exists (first run), create it
        if (!globalLeague) {
            globalLeague = await db.league.create({
                data: {
                    name: 'Global League',
                    slug: 'global-league',
                    isGlobal: true,
                    // No creator? Or system creator?
                }
            });
        }

        // Join League
        await db.leagueMember.create({
            data: {
                userId: newUser.id,
                leagueId: globalLeague.id
            }
        });

        return {
            name: newUser.name ?? '',
            email: newUser.email,
            userId: newUser.id,
            userName: newUser.username,
            userType: UserTypeEntity.GAMER, // Default
        };
    }

    public async getUserIdByUserName(userName: string): Promise<string | undefined> {
        const user = await db.user.findUnique({
             where: { username: userName }
        });
        return user?.id;
    }

    public async getUserDataById(userId: string): Promise<DbUser> {
        const user = await db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error("User data not found");
        }

        return {
            name: user.name ?? '',
            email: user.email,
            userName: user.username,
            password: user.password,
            salt: user.salt ?? '',
            userType: UserTypeEntity.GAMER, // We didn't store userType in schema? 
            // Existing 'DbUser' has userType. Schema.prisma 'User' does not have 'userType'.
            // I should default it or add it to schema if needed. 
            // Migration script didn't migrate it either.
            // Defaulting to GAMER.
            userId: user.id
        };
    }
}
