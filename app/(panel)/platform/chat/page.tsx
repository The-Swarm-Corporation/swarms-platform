import ChatInterface from "@/shared/components/chat/main";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  return redirect("/");
  // return <ChatInterface />;
}
