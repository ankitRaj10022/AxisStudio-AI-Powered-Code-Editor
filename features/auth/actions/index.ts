"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logDatabaseError } from "@/lib/database-error";
import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";


export const getUserById = async (id:string)=>{
    try {
        const user = await db.user.findUnique({
            where:{id},
            include:{accounts:true}
        })
        return user
    } catch (error) {
        logDatabaseError("getUserById", error)
        return null
    }
}

export const getAccountByUserId = async (userId:string)=>{
    try {
        const account = await db.account.findFirst({
            where:{
                userId
            }
        })
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
