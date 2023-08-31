"use client";
// because SessionProvider uses client component or react context and right now it is unavailable in server components

export { SessionProvider as default } from "next-auth/react";
