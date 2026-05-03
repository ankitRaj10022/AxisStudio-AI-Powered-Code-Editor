"use server"
import { currentUser } from "@/features/auth/actions";
import { getDbOrNull } from "@/lib/db"
import { logDatabaseError } from "@/lib/database-error";
import { TemplateFolder } from "../libs/path-to-json";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import {
  playgrounds,
  starMarks,
  templateFiles,
  users,
} from "@/lib/database/schema";
import type { Template } from "@/lib/database/constants";


// Toggle marked status for a problem
export const toggleStarMarked = async (playgroundId: string, isChecked: boolean) => {
    const user = await currentUser();
    const userId = user?.id;
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const db = getDbOrNull();
    if (!db) {
      throw new Error("Postgres database is not configured");
    }

    if (isChecked) {
      await db
        .insert(starMarks)
        .values({
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        })
        .onConflictDoUpdate({
          target: [starMarks.userId, starMarks.playgroundId],
          set: {
            isMarked: isChecked,
          },
        });
    } else {
      await db
        .delete(starMarks)
        .where(
          and(
            eq(starMarks.userId, userId),
            eq(starMarks.playgroundId, playgroundId),
          ),
        );
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    logDatabaseError("toggleStarMarked", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const createPlayground = async (data:{
    title: string;
    template: Template;
    description?: string;
  })=>{
    const {template , title , description} = data;

    const user = await currentUser();
    try {
        if (!user?.id) {
          throw new Error("User ID is required");
        }

        const db = getDbOrNull();
        if (!db) {
          throw new Error("Postgres database is not configured");
        }

        const [playground] = await db
          .insert(playgrounds)
          .values({
            title,
            description,
            template,
            userId: user.id,
          })
          .returning();

        return playground;
    } catch (error) {
        logDatabaseError("createPlayground", error)
        return null
    }
}


export const getAllPlaygroundForUser = async ()=>{
    const user = await currentUser();
    try {
        if (!user?.id) {
          return [];
        }

        const db = getDbOrNull();
        if (!db) {
          return [];
        }

        const rows = await db
          .select({
            playground: playgrounds,
            owner: users,
            isMarked: starMarks.isMarked,
          })
          .from(playgrounds)
          .innerJoin(users, eq(playgrounds.userId, users.id))
          .leftJoin(
            starMarks,
            and(
              eq(starMarks.playgroundId, playgrounds.id),
              eq(starMarks.userId, user.id),
            ),
          )
          .where(eq(playgrounds.userId, user.id))
          .orderBy(desc(playgrounds.updatedAt), desc(playgrounds.createdAt));

        return rows.map(({ playground, owner, isMarked }) => ({
          ...playground,
          user: owner,
          Starmark: typeof isMarked === "boolean" ? [{ isMarked }] : [],
        }));
    } catch (error) {
        logDatabaseError("getAllPlaygroundForUser", error)
        return []
    }
}

export const getPlaygroundById = async (id:string)=>{
    try {
        const db = getDbOrNull();
        if (!db) {
          return null;
        }

        const rows = await db
          .select({
            playground: playgrounds,
            templateContent: templateFiles.content,
          })
          .from(playgrounds)
          .leftJoin(templateFiles, eq(templateFiles.playgroundId, playgrounds.id))
          .where(eq(playgrounds.id, id))
          .limit(1);

        const row = rows[0];
        if (!row) {
          return null;
        }

        return {
          id: row.playground.id,
          name: row.playground.title,
          title: row.playground.title,
          description: row.playground.description,
          template: row.playground.template,
          templateFiles:
            row.templateContent === null
              ? []
              : [{ content: row.templateContent }],
        };
    } catch (error) {
        logDatabaseError("getPlaygroundById", error)
        return null
    }
}

export const SaveUpdatedCode = async (playgroundId: string, data: TemplateFolder) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const db = getDbOrNull();
    if (!db) {
      throw new Error("Postgres database is not configured");
    }

    const [updatedPlayground] = await db
      .insert(templateFiles)
      .values({
        playgroundId,
        content: data,
      })
      .onConflictDoUpdate({
        target: templateFiles.playgroundId,
        set: {
          content: data,
          updatedAt: new Date(),
        },
      })
      .returning();

    return updatedPlayground;
  } catch (error) {
    logDatabaseError("SaveUpdatedCode", error);
    return null;
  }
};

export const deleteProjectById = async (id:string)=>{
    try {
        const db = getDbOrNull();
        if (!db) {
          throw new Error("Postgres database is not configured");
        }

        await db.delete(playgrounds).where(eq(playgrounds.id, id))
        revalidatePath("/dashboard")
    } catch (error) {
        logDatabaseError("deleteProjectById", error)
    }
}


export const editProjectById = async (id:string,data:{title:string , description:string})=>{
    try {
        const db = getDbOrNull();
        if (!db) {
          throw new Error("Postgres database is not configured");
        }

        await db
          .update(playgrounds)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(playgrounds.id, id))
        revalidatePath("/dashboard")
    } catch (error) {
        logDatabaseError("editProjectById", error)
    }
}

export const duplicateProjectById = async (id: string) => {
    try {
        const db = getDbOrNull();
        if (!db) {
          throw new Error("Postgres database is not configured");
        }

        const rows = await db
          .select({
            playground: playgrounds,
            templateContent: templateFiles.content,
          })
          .from(playgrounds)
          .leftJoin(templateFiles, eq(templateFiles.playgroundId, playgrounds.id))
          .where(eq(playgrounds.id, id))
          .limit(1);

        const originalPlayground = rows[0];

        if (!originalPlayground) {
            throw new Error("Original playground not found");
        }

        const [duplicatedPlayground] = await db
          .insert(playgrounds)
          .values({
            title: `${originalPlayground.playground.title} (Copy)`,
            description: originalPlayground.playground.description,
            template: originalPlayground.playground.template,
            userId: originalPlayground.playground.userId,
          })
          .returning();

        if (originalPlayground.templateContent) {
          await db.insert(templateFiles).values({
            playgroundId: duplicatedPlayground.id,
            content: originalPlayground.templateContent,
          });
        }

        revalidatePath("/dashboard");

        return duplicatedPlayground;
    } catch (error) {
        logDatabaseError("duplicateProjectById", error);
        return null
    }
};
