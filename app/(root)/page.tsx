import { Suspense } from "react";
import { getCurrentUser } from "@/modules/authentication/actions";
import { ChatMessageView } from "@/modules/chat/components/chat-message-view";
import { LoadingState } from "@/components/loading-state";

export default function Home() {
  return (
    <section className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-8">
      <Suspense
        fallback={
          <LoadingState label="Loading your chat..." />
        }
      >
        <CurrentUserChat />
      </Suspense>
    </section>
  );
}

async function CurrentUserChat() {
  const user = await getCurrentUser();
  return <ChatMessageView userName={user?.name} />;
}
