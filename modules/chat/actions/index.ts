"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/modules/authentication/actions";
import { MessageRole, MessageType } from "@/lib/generated/prisma/browser";
import { revalidatePath } from "next/cache";

export interface ICreateChatWithMessage {
    model: string;
    content: string;
}

export async function createChatWithMessage({ model, content }: ICreateChatWithMessage) {
    try {
        const user = await getCurrentUser();
        if(!user) {
            return {success: false, message: "User not authenticated."};
        }
        const title = content.length > 20 ? content.substring(0, 20) + "..." : content;
        const chat = await prisma.chat.create({
            data: {
                userId: user.id,
                title,
                model,
                messages: {
                    create: {
                        content,
                        messageRole: MessageRole.USER,
                        model,
                        messageType: MessageType.NORMAL
                    }
                }
            },
            include: {
                messages: true
            }
        });
        revalidatePath("/", "page");
        return { success: true, data: chat };
    } catch (error) {
        console.error("Error creating chat with message:", error);
        return { success: false, message: "Failed to create chat." };
    }
}

export async function getAllChats(limit: number = 20, offset: number = 0) {
    if (!Number.isSafeInteger(limit) || limit < 1) {
        return { success: false, message: "Limit must be a positive integer." };
    }
    if (!Number.isSafeInteger(offset) || offset < 0) {
        return { success: false, message: "Offset must be a non-negative integer." };
    }

    try {
        const user = await getCurrentUser();
        if(!user) {
            return {success: false, message: "User not authenticated."};
        }
        const chats = await prisma.chat.findMany({
            where: {
                userId: user.id
            },
            include: {
                messages: true
            },
            take: limit,
            skip: offset,
            orderBy: [
                { updatedAt: "desc" },
                { id: "desc" },
            ],
        });
        revalidatePath("/", "page");
        return { success: true, data: chats };
    } catch (error) {
        console.error("Error fetching all chats:", error);
        return { success: false, message: "Failed to fetch chats." };
    }
}

export async function getChatById(chatId: string) {
    try {
        const user = await getCurrentUser();
        if(!user) {
            return {success: false, message: "User not authenticated."};
        }
        const chat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId: user.id
            },
            include: {
                messages: true
            }
        });
        if (!chat) {
            return { success: false, message: "Chat not found." };
        }
        revalidatePath("/", "page");
        return { success: true, data: chat };
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        return { success: false, message: "Failed to fetch chat." };
    }
}

export async function deleteChatById(chatId: string) {
    try {
        const user = await getCurrentUser();
        if(!user) {
            return {success: false, message: "User not authenticated."};
        }
        const chat = await prisma.chat.delete({
            where: {
                id: chatId,
                userId: user.id
            }
        });
        if (!chat) {
            return { success: false, message: "Chat not found." };
        }
        revalidatePath("/", "page");
        return { success: true, message: "Chat deleted successfully." };
    } catch (error) {
        console.error("Error deleting chat by ID:", error);
        return { success: false, message: "Failed to delete chat." };
    }
}