"use client";

import { useState, useRef, useEffect } from "react";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";

export default function WhisperBox() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [searchQ, setSearchQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    user,
    accessToken,
    phase,
    loading: authLoading,
    error: authError,
    privateKey,
    publicKey,
    login,
    register,
    logout,
  } = useAuth();

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
  } = useChat({ user, accessToken, privateKey, publicKey });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvo]);

  const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (authMode === "login") {
      await login(formData);
    } else {
      await register(formData);
    }
  };

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

  if (phase === "auth") {
    return (
      <AuthScreen
        mode={authMode}
        onMode={setAuthMode}
        onLogin={handleAuthSubmit}
        onRegister={handleAuthSubmit}
        loading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#060c19] text-[#dde8f5] font-sans overflow-hidden">
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
      />

      <ChatArea
        activeConvo={activeConvo}
        messages={messages}
        msgLoading={msgLoading}
        input={input}
        setInput={setInput}
        handleSend={onSend}
        sending={false} // Handled internally in hook
        bottomRef={bottomRef}
        inputRef={inputRef}
      />
    </div>
  );
}

