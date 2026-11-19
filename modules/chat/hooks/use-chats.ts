import {useInfiniteQuery, useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {createChatWithMessage, getAllChats, getChatById, deleteChatById} from "@/modules/chat/actions";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

export const useGetChats = (limit = 20) => {
    return useInfiniteQuery({
        queryKey: ["chats", limit],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => getAllChats(limit, pageParam),
        getNextPageParam: (lastPage, pages) => {
            if (!lastPage.success || !lastPage.data || lastPage.data.length < limit) {
                return undefined;
            }
            return pages.length * limit;
        },
    });
};

export const useGetChatById = (chatId: string) => {
    return useQuery({
        queryKey: ["chat", chatId],
        queryFn: () => getChatById(chatId),
        enabled: !!chatId,
    });
}

export const useCreateChat = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: createChatWithMessage,
        onSuccess: (result) => {
            if (!result.success || !result.data) {
                toast.error(
                    "message" in result ? result.message : "Failed to create chat.",
                );
                return;
            }
            toast.success("New chat created");
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            router.push(`/chat/${result.data.id}?autoTrigger=true`);
        },
        onError: (error: Error) => {
            console.error("Failed to create chat.", error);
            toast.error("Failed to create chat.");
        }
    });
};

export const useDeleteChat = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: (chatId: string) => deleteChatById(chatId),
        onSuccess: (result) => {
            if (!result.success) {
                toast.error(result.message);
                return;
            }
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            router.push("/chat");
        },
        onError: (error: Error) => {
            console.error("Failed to delete chat.", error);
            toast.error("Failed to delete chat.");
        }
    });
};
