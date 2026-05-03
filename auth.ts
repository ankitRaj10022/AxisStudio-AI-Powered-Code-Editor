import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDbOrNull } from "./lib/db";
import { logDatabaseError } from "./lib/database-error";
import { DEFAULT_USER_ROLE, type UserRole } from "./lib/database/constants";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "./lib/database/schema";

const authDb = getDbOrNull();
const adapter = authDb
  ? DrizzleAdapter(authDb, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
      authenticatorsTable: authenticators,
    })
  : undefined;

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ account }) {
      if (!account) return false;

      if (!adapter) {
        logDatabaseError(
          "auth.signIn",
          new Error("Postgres database is not configured"),
        );
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (!token.sub) return token;

      if (user?.name) {
        token.name = user.name;
      }

      if (user?.email) {
        token.email = user.email;
      }

      const userRole = (user as { role?: UserRole } | undefined)?.role;
      token.role = userRole ?? (token.role as UserRole | undefined) ?? DEFAULT_USER_ROLE;

      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.sub && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  adapter,
  session: { strategy: "jwt" },
  ...authConfig,
});
