"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export default function Page() {
  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900
text-black dark:text-white
border-neutral-300 dark:border-neutral-800">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
