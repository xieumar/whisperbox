"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { SplashScreen } from "@/components/auth/splash-screen";
import { SecurityView } from "@/components/chat/security-view";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";

export default function WhisperBox() {
  const [searchQ, setSearchQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "security" | "profile">("chats");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    user,
    accessToken,
    phase: authPhase,
    initialized,
    privateKey,
    publicKey,
    logout,
  } = useAuth();

  const router = useRouter();

  const {
    wsStatus,
    convos,
    activeConvo,
    messages,
    msgLoading,
    searching,
    searchResults,
    selectConvo,
    searchUsers,
    sendMessage,
    setSearchResults,
    sending,
  } = useChat({ user, accessToken, privateKey, publicKey });

  // Handle redirects
  useEffect(() => {
    if (initialized && authPhase === "auth") {
      router.push("/login");
    }
  }, [initialized, authPhase, router]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvo]);

  const onSelectConvo = async (convo: any) => {
    setShowSearch(false);
    setSearchResults([]);
    setSearchQ("");
    await selectConvo(convo);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const onSearchChange = (q: string) => {
    setSearchQ(q);
    setShowSearch(true);
    searchUsers(q);
  };

  const onSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  // Show splash/loading while initializing or if redirected
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
        wsStatus={wsStatus}
        doLogout={logout}
        searchQ={searchQ}
        handleSearchChange={onSearchChange}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searching={searching}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setSearchQ={setSearchQ}
        convos={convos}
        activeId={activeConvo?.user_id}
        messages={messages}
        selectConvo={onSelectConvo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "chats" && (
        <ChatArea
          activeConvo={activeConvo}
          messages={messages}
          msgLoading={msgLoading}
          input={input}
          setInput={setInput}
          handleSend={onSend}
          sending={sending}
          bottomRef={bottomRef}
          inputRef={inputRef}
        />
      )}

      {activeTab === "security" && (
        <SecurityView user={user} />
      )}

      {activeTab === "profile" && (
        <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Authorized Profile</h2>
            <p className="text-[11px] text-muted-foreground/40">Managing identity {user?.display_name}...</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

