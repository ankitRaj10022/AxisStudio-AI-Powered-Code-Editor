import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { TemplateFolder } from "@/features/playground/libs/path-to-json";
import { DEFAULT_TEMPLATE, DEFAULT_USER_ROLE, templates, userRoles } from "./constants";

export const userRoleEnum = pgEnum("user_role", [...userRoles]);
export const templateEnum = pgEnum("template", [...templates]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default(DEFAULT_USER_ROLE),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    providerAccountPk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({
    verificationPk: primaryKey({
      columns: [table.identifier, table.token],
    }),
  }),
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (table) => ({
    authenticatorPk: primaryKey({
      columns: [table.userId, table.credentialID],
    }),
  }),
);

export const playgrounds = pgTable(
  "playgrounds",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    template: templateEnum("template").notNull().default(DEFAULT_TEMPLATE),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdIdx: index("playgrounds_user_id_idx").on(table.userId),
  }),
);

export const templateFiles = pgTable(
  "template_files",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    content: jsonb("content").$type<TemplateFolder>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    playgroundId: text("playground_id")
      .notNull()
      .references(() => playgrounds.id, { onDelete: "cascade" }),
  },
  (table) => ({
    playgroundIdUnique: uniqueIndex("template_files_playground_id_unique").on(
      table.playgroundId,
    ),
  }),
);

export const starMarks = pgTable(
  "star_marks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    playgroundId: text("playground_id")
      .notNull()
      .references(() => playgrounds.id, { onDelete: "cascade" }),
    isMarked: boolean("is_marked").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userPlaygroundUnique: uniqueIndex("star_marks_user_playground_unique").on(
      table.userId,
      table.playgroundId,
    ),
    userIdIdx: index("star_marks_user_id_idx").on(table.userId),
    playgroundIdIdx: index("star_marks_playground_id_idx").on(table.playgroundId),
  }),
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("chat_messages_user_id_idx").on(table.userId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  playgrounds: many(playgrounds),
  starMarks: many(starMarks),
  chatMessages: many(chatMessages),
  authenticators: many(authenticators),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

export const playgroundsRelations = relations(playgrounds, ({ one, many }) => ({
  user: one(users, {
    fields: [playgrounds.userId],
    references: [users.id],
  }),
  templateFile: one(templateFiles, {
    fields: [playgrounds.id],
    references: [templateFiles.playgroundId],
  }),
  starMarks: many(starMarks),
}));

export const templateFilesRelations = relations(templateFiles, ({ one }) => ({
  playground: one(playgrounds, {
    fields: [templateFiles.playgroundId],
    references: [playgrounds.id],
  }),
}));

export const starMarksRelations = relations(starMarks, ({ one }) => ({
  user: one(users, {
    fields: [starMarks.userId],
    references: [users.id],
  }),
  playground: one(playgrounds, {
    fields: [starMarks.playgroundId],
    references: [playgrounds.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export type DatabaseUser = typeof users.$inferSelect;
export type DatabaseAccount = typeof accounts.$inferSelect;
export type DatabasePlayground = typeof playgrounds.$inferSelect;
