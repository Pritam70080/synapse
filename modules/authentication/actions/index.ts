"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return null;
    }
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        },
        select: {
            id: true,
            email: true,
            image: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });
    return user;
}