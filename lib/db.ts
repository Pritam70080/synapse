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