"use client";

import { useState, useRef, useEffect } from "react";
import { ChatArea } from "@/components/chat/chat-area";
import { useChat } from "@/hooks/use-chat";

export default function ChatsPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    activeConvo,
    messages,
    msgLoading,
    sendMessage,
    sending,
  } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvo]);

  const onSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  return (
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
  );
}
