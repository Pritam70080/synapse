import {Pool} from "pg";
import {PrismaClient} from "./generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

const globalsForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!
})

const adapter = new PrismaPg(pool);

export const prisma = globalsForPrisma.prisma ?? new PrismaClient({adapter: adapter});

if(process.env.NODE_ENV !== "production") {
    globalsForPrisma.prisma = prisma;
}

export const MessageRole = {
    USER: "USER",
    ASSISTANT: "ASSISTANT",
    SYSTEM: "SYSTEM",
} as const;

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole];

export const MessageType = {
    NORMAL: "NORMAL",
    ERROR: "ERROR",
    TOOL_CALL: "TOOL_CALL",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

