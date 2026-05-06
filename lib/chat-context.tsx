"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { User, Message, Conversation } from "@/lib/types";
import { CryptoService } from "@/lib/crypto";
import { ApiService } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ChatContextType {
  wsStatus: "connected" | "connecting" | "disconnected";
  convos: Conversation[];
  activeConvo: Conversation | null;
  messages: Record<string, Message[]>;
  msgLoading: boolean;
  searching: boolean;
  searchResults: User[];
  searchQ: string;
  setSearchQ: (q: string) => void;
  sending: boolean;
  selectConvo: (convo: Partial<Conversation> & { user_id: string }) => Promise<void>;
  searchUsers: (query: string) => void;
  sendMessage: (text: string) => Promise<void>;
  setSearchResults: (results: User[]) => void;
  loadMessages: (uid: string, force?: boolean) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, accessToken, privateKey, publicKey } = useAuth();
  
  const [wsStatus, setWsStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgLoading, setMsgLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [sending, setSending] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pkCache = useRef<Record<string, CryptoKey>>({});
  const loadedSet = useRef<Set<string>>(new Set());
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);

  const userRef = useRef(user);
  const tokenRef = useRef(accessToken);
  const privKeyRef = useRef(privateKey);
  const pubKeyRef = useRef(publicKey);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);
  useEffect(() => { privKeyRef.current = privateKey; }, [privateKey]);
  useEffect(() => { pubKeyRef.current = publicKey; }, [publicKey]);

  const loadMessages = async (uid: string, force = false) => {
    if (!force && loadedSet.current.has(uid)) return;
    if (!tokenRef.current || !privKeyRef.current) return;
    
    loadedSet.current.add(uid);
    setMsgLoading(true);
    try {
      const raw = await ApiService.getMessages(uid, tokenRef.current);
      const decrypted = await Promise.all(
        raw.map(async (m: any) => {
          const isMine = m.from_user_id === userRef.current?.id;
          let text = "[Decryption failed]";
          try { text = await CryptoService.decrypt(m.payload, privKeyRef.current!, isMine); } catch (err) {}
          return { id: m.id, from_user_id: m.from_user_id, to_user_id: m.to_user_id, text, sentAt: m.created_at, isMine } as Message;
        })
      );
      
      const sorted = decrypted.reverse();
      setMessages((prev) => {
        const existing = prev[uid] || [];
        const existingIds = new Set(existing.map(m => m.id));
        const newOnes = sorted.filter(m => !existingIds.has(m.id));
        const all = [...newOnes, ...existing].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        return { ...prev, [uid]: all };
      });
      loadedSet.current.add(uid);
    } catch (err) {
      loadedSet.current.delete(uid);
    } finally {
      setMsgLoading(false);
    }
  };

  const syncConversations = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const latestConvos = await ApiService.getConversations(tokenRef.current);
      setConvos((prev) => {
        latestConvos.forEach((newC: Conversation) => {
          const oldC = prev.find(p => p.user_id === newC.user_id);
          if ((oldC && oldC.last_message_at !== newC.last_message_at) || !oldC) {
            loadMessages(newC.user_id, true);
          }
        });
        return latestConvos;
      });
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (accessToken) syncConversations();
  }, [accessToken, syncConversations]);

  useEffect(() => {
    if (wsStatus === "connected") {
      if (pollTimer.current) clearInterval(pollTimer.current);
      return;
    }
    pollTimer.current = setInterval(() => { if (tokenRef.current) syncConversations(); }, 10000);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [wsStatus, syncConversations]);

  const connectWS = useCallback((token: string) => {
    if (wsRef.current) wsRef.current.close();
    setWsStatus("connecting");
    const wsUrl = (ApiService.BASE_URL || "https://whisperbox.koyeb.app").replace("http", "ws") + "/ws";
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => {
      setWsStatus("disconnected");
      setTimeout(() => { if (tokenRef.current) connectWS(tokenRef.current); }, 5000);
    };
    ws.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.event !== "message.receive") return;
        const { id, from_user_id, to_user_id, payload, created_at } = msg;
        const me = userRef.current;
        const priv = privKeyRef.current;
        if (!me || !priv) return;

        const isMine = from_user_id === me.id;
        const partnerId = isMine ? to_user_id : from_user_id;
        let text = "[Unable to decrypt]";
        try { text = await CryptoService.decrypt(payload, priv, isMine); } catch (err) {}
        const message: Message = { id, from_user_id, to_user_id, text, sentAt: created_at, isMine };
        
        setMessages((prev) => {
          const existing = prev[partnerId] || [];
          if (existing.some((m) => m.id === id)) return prev;
          return { ...prev, [partnerId]: [...existing, message] };
        });

        setConvos((prev) => {
          const idx = prev.findIndex((c) => c.user_id === partnerId);
          if (idx >= 0) {
            const arr = [...prev];
            arr[idx] = { ...arr[idx], last_message_at: created_at };
            return [arr[idx], ...arr.filter((_, i) => i !== idx)];
          } else {
            return [{ user_id: partnerId, username: msg.from_username || "unknown", display_name: msg.from_display_name || "New Contact", last_message_at: created_at }, ...prev];
          }
        });
      } catch (err) {}
    };
  }, []);

  useEffect(() => {
    if (accessToken) connectWS(accessToken);
    return () => wsRef.current?.close();
  }, [accessToken, connectWS]);

  const selectConvo = async (convo: Partial<Conversation> & { user_id: string }) => {
    setActiveConvo(convo as Conversation);
    await loadMessages(convo.user_id);
  };

  const searchUsers = (query: string) => {
    setSearchQ(query);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await ApiService.search(query, tokenRef.current);
        setSearchResults(results);
      } catch {}
      setSearching(false);
    }, 300);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || !activeConvo || !user || !publicKey) return;
    setSending(true);
    const recipientId = activeConvo.user_id;
    const tempId = `tmp_${Date.now()}`;
    const tempMsg: Message = { id: tempId, from_user_id: user.id, to_user_id: recipientId, text, isMine: true, sentAt: new Date().toISOString(), status: "sending" };

    setMessages(prev => ({ ...prev, [recipientId]: [...(prev[recipientId] || []), tempMsg] }));

    try {
      let rPubKey = pkCache.current[recipientId];
      if (!rPubKey) {
        const { public_key } = await ApiService.getPublicKey(recipientId, tokenRef.current);
        rPubKey = await CryptoService.importPublicKey(public_key);
        pkCache.current[recipientId] = rPubKey;
      }
      const payload = await CryptoService.encrypt(text, rPubKey, publicKey);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "message.send", to: recipientId, payload }));
      } else {
        await ApiService.sendMessage({ to: recipientId, payload }, tokenRef.current);
      }
      setMessages(prev => ({
        ...prev,
        [recipientId]: (prev[recipientId] || []).map(m => m.id === tempId ? { ...m, status: "sent" } : m)
      }));
      setConvos(prev => {
        const idx = prev.findIndex(c => c.user_id === recipientId);
        const now = new Date().toISOString();
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { ...arr[idx], last_message_at: now };
          return [arr[idx], ...arr.filter((_, i) => i !== idx)];
        } else {
          return [{ user_id: recipientId, username: activeConvo.username, display_name: activeConvo.display_name, last_message_at: now }, ...prev];
        }
      });
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [recipientId]: (prev[recipientId] || []).map(m => m.id === tempId ? { ...m, status: "error" } : m)
      }));
    } finally { setSending(false); }
  };

  return (
    <ChatContext.Provider value={{
      wsStatus, convos, activeConvo, messages, msgLoading, searching, searchResults, searchQ, setSearchQ, sending,
      selectConvo, searchUsers, sendMessage, setSearchResults, loadMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};
