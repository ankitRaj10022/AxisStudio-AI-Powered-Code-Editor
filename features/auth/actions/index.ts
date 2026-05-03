"use server";

import { auth } from "@/auth";
import { getDbOrNull } from "@/lib/db";
import { accounts, users } from "@/lib/database/schema";
import { logDatabaseError } from "@/lib/database-error";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";
import { eq } from "drizzle-orm";


export const getUserById = async (id:string)=>{
    try {
        const db = getDbOrNull();
        if (!db) return null;

        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

        if (!user) return null;

        const linkedAccounts = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, id));

        return {
          ...user,
          accounts: linkedAccounts,
        };
    } catch (error) {
        logDatabaseError("getUserById", error)
        return null
    }
}

export const getAccountByUserId = async (userId:string)=>{
    try {
        const db = getDbOrNull();
        if (!db) return null;

        const [account] = await db
          .select()
          .from(accounts)
          .where(eq(accounts.userId, userId))
          .limit(1);

        return account
    } catch (error) {
        logDatabaseError("getAccountByUserId", error)
        return null
    }
}

export const currentUser = async()=>{
    try {
        const user = await auth()
        return user?.user;
    } catch (error) {
        if (isDynamicServerError(error)) {
            throw error
        }
        logDatabaseError("currentUser", error)
        return null
    }
}
