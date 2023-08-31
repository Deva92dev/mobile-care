import { DefaultSession } from "next-auth";

// These are typescript declarations files.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
