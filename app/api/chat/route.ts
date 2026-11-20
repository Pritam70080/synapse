import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { prisma, MessageRole } from "@/lib/db";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/modules/authentication/actions";


const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});



function extractPartsAsJSON(message: UIMessage) {
  if (message.parts && Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  return JSON.stringify([]);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("chatId" in body) ||
      typeof body.chatId !== "string" ||
      !("messages" in body) ||
      !Array.isArray(body.messages)
    ) {
      return Response.json({ error: "Invalid chat request." }, { status: 400 });
    }

    const chatId = body.chatId;
    const newMessages = body.messages as UIMessage[];
    const model =
      "model" in body && typeof body.model === "string"
        ? body.model
        : "";
    const skipUserMessage =
      "skipUserMessage" in body && body.skipUserMessage === true;

    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "User not authenticated." }, { status: 401 });
    }

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId: user.id },
    });
    if (!chat) {
      return Response.json({ error: "Chat not found." }, { status: 404 });
    }

    const selectedModel = model || chat.model;
    if (!selectedModel) {
      return Response.json({ error: "A model is required." }, { status: 400 });
    }

    const allUIMessages = newMessages;
    const modelMessages = await convertToModelMessages(allUIMessages);

    const result = streamText({
      model: openRouter.chat(selectedModel),
      messages: modelMessages,
      system: CHAT_SYSTEM_PROMPT,
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: allUIMessages,
      onFinish: async ({ responseMessage }) => {
        try {
          const messagesToSave = [];

          if (!skipUserMessage) {
            const latestUserMessage = newMessages[newMessages.length - 1];

            if (latestUserMessage?.role === "user") {
              const userPartsJSON = extractPartsAsJSON(latestUserMessage);


              messagesToSave.push({
                chatId,
                content: userPartsJSON,
                messageRole: MessageRole.USER,
                model: selectedModel,
                messageType: "NORMAL" as const,
              });
            }
          }

          // Save assistant response
          if (responseMessage?.parts && responseMessage.parts.length > 0) {
            const assistantPartsJSON = extractPartsAsJSON(responseMessage);
       

            messagesToSave.push({
              chatId,
              content: assistantPartsJSON,
              messageRole: MessageRole.ASSISTANT,
              model: selectedModel,
              messageType: "NORMAL" as const,
            });
          }

          if (messagesToSave.length > 0) {
            await prisma.message.createMany({
              data: messagesToSave,
            });
           
          }
        } catch (error) {
          console.error("❌ Error saving messages:", error);
        }
      },
    });
  } catch (error: unknown) {
    console.error("❌ API Route Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ 
        error: message,
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}