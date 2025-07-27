// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { getUserById } from "./data/user";
import { UserRole } from "./lib/generated/prisma";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      //Allow 0Auth without email verification

      if (account?.provider !== "credentials") return true;

      const exisitingUser = await getUserById({ id: user.id });

      if (!exisitingUser?.emailVerified) return false;

      //  TODO: Add 2FA check
      if (exisitingUser.isTwoFactorEnabled) {
        const twoFactorConformation = await getTwoFactorConfirmationByUserId(
          exisitingUser.id
        );
        if (!twoFactorConformation) {
          return false;
        }

        //Delete two factor confirmation for next sign in
        await db.twoFactorConformation.delete({
          where: {
            id: twoFactorConformation.id,
          },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const exisitingUser = await getUserById({ id: token.sub });

      if (!exisitingUser) return token;

      token.role = exisitingUser.role;
      token.isTwoFactorEnabled = exisitingUser.isTwoFactorEnabled;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
