"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/chat/sidebar";
import { SplashScreen } from "@/components/auth/splash-screen";
import { useAuth } from "@/hooks/use-auth";
import { ChatProvider, useChat } from "@/lib/chat-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, phase: authPhase, initialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const chat = useChat();
  
  const onSelectConvo = async (convo: any) => {
    await chat.selectConvo(convo);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  if (!initialized || authPhase === "auth") {
    return (
      <SplashScreen
        onGetStarted={() => router.push("/signup")}
        onRestore={() => router.push("/login")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto border-x border-white/5 relative">
        <Sidebar
          user={user}
          wsStatus={chat.wsStatus}
          doLogout={logout}
          searchQ={chat.searchQ}
          handleSearchChange={(q) => chat.searchUsers(q)}
          showSearch={chat.searchQ.length > 0}
          setShowSearch={() => {}} // Could be added to context if needed
          searching={chat.searching}
          searchResults={chat.searchResults}
          setSearchResults={chat.setSearchResults}
          setSearchQ={chat.setSearchQ}
          convos={chat.convos}
          activeId={chat.activeConvo?.user_id}
          messages={chat.messages}
          selectConvo={onSelectConvo}
        />
        
        <div className="flex-1 flex flex-col relative min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { initialized, phase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && phase === "auth") {
      router.push("/login");
    }
  }, [initialized, phase, router]);

  return (
    <ChatProvider>
      <DashboardContent>{children}</DashboardContent>
    </ChatProvider>
  );
}
