import { Button } from "@/components/ui/button";
import { UserButton } from "@/modules/authentication/components/user-button";


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <UserButton/>
    </div>
  );
}
