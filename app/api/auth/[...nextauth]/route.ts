import { mergeAnonymousCartWithUserCart } from "@/lib/db/cart";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

// You can postfix an expression with ! to tell TypeScript that you know it's not null or undefined. This works the same as an 'as' assertion but these is are not good practice, in that case Zod comes into the picture. It helps validate the values

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as PrismaClient) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id; // user.id from user who logged
      return session;
    },
  },
  events: {
    // because our mergedCart fn makes database operations, that's why async
    async signIn({ user }) {
      await mergeAnonymousCartWithUserCart(user.id);
    },
  },
};

const handler = NextAuth(authOptions);

// right now, NextAuth is not compatible with app directory, that's why weird syntax like below
export { handler as GET, handler as POST };
