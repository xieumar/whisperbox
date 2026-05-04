"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { User, Message, Conversation } from "@/lib/types";
import { CryptoService } from "@/lib/crypto";
import { ApiService } from "@/lib/api";

interface UseChatProps {
  user: User | null;
  accessToken: string | null;
  privateKey: CryptoKey | null;
  publicKey: CryptoKey | null;
}

export function useChat({ user, accessToken, privateKey, publicKey }: UseChatProps) {
  const [wsStatus, setWsStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [msgLoading, setMsgLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [sending, setSending] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const pkCache = useRef<Record<string, CryptoKey>>({});
  const loadedSet = useRef<Set<string>>(new Set());
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Sync refs for use in callbacks
  const userRef = useRef(user);
  const tokenRef = useRef(accessToken);
  const privKeyRef = useRef(privateKey);
  const pubKeyRef = useRef(publicKey);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);
  useEffect(() => { privKeyRef.current = privateKey; }, [privateKey]);
  useEffect(() => { pubKeyRef.current = publicKey; }, [publicKey]);

  // Load initial conversations
  useEffect(() => {
    if (accessToken) {
      ApiService.getConversations(accessToken)
        .then(setConvos)
        .catch(() => {});
    }
  }, [accessToken]);

  // WebSocket Connection
  const connectWS = useCallback((token: string) => {
    if (wsRef.current) wsRef.current.close();
    setWsStatus("connecting");
    
    // Convert https to wss for the WebSocket connection
    const wsUrl = (ApiService.BASE_URL || "https://whisperbox.koyeb.app").replace("http", "ws") + "/ws";
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => {
      setWsStatus("disconnected");
      // Reconnect after 5s if still logged in
      setTimeout(() => {
        if (tokenRef.current) connectWS(tokenRef.current);
      }, 5000);
    };
    ws.onerror = () => setWsStatus("disconnected");

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

        let text = "[Unable to decrypt message]";
        try { 
          text = await CryptoService.decrypt(payload, priv, isMine); 
        } catch (err) {
          console.error("Decryption error:", err);
        }

        const message: Message = { id, from_user_id, to_user_id, text, sentAt: created_at, isMine };
        
        setMessages((prev) => {
          const existing = prev[partnerId] || [];
          if (existing.some((m) => m.id === id)) return prev;
          return { ...prev, [partnerId]: [...existing, message] };
        });

        // Update conversation list
        setConvos((prev) => {
          const idx = prev.findIndex((c) => c.user_id === partnerId);
          if (idx >= 0) {
            const arr = [...prev];
            arr[idx] = { ...arr[idx], last_message_at: created_at };
            return [arr[idx], ...arr.filter((_, i) => i !== idx)];
          }
          return prev;
        });
      } catch (err) {
        console.error("WS message error:", err);
      }
    };
  }, []);

  useEffect(() => {
    if (accessToken) connectWS(accessToken);
    return () => wsRef.current?.close();
  }, [accessToken, connectWS]);

  const loadMessages = async (uid: string) => {
    if (loadedSet.current.has(uid) || !tokenRef.current || !privKeyRef.current) return;
    loadedSet.current.add(uid);
    setMsgLoading(true);
    
    try {
      const raw = await ApiService.getMessages(uid, tokenRef.current);
      const decrypted = await Promise.all(
        raw.map(async (m: any) => {
          const isMine = m.from_user_id === userRef.current?.id;
          let text = "[Decryption failed]";
          try { 
            text = await CryptoService.decrypt(m.payload, privKeyRef.current!, isMine); 
          } catch {}
          return { 
            id: m.id, 
            from_user_id: m.from_user_id, 
            to_user_id: m.to_user_id, 
            text, 
            sentAt: m.created_at, 
            isMine 
          } as Message;
        })
      );
      
      const sorted = decrypted.reverse();
      setMessages((prev) => {
        const existing = prev[uid] || [];
        const existingIds = new Set(existing.map(m => m.id));
        const newOnes = sorted.filter(m => !existingIds.has(m.id));
        const all = [...newOnes, ...existing].sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        return { ...prev, [uid]: all };
      });
    } catch (err) {
      loadedSet.current.delete(uid);
    } finally {
      setMsgLoading(false);
    }
  };

  const selectConvo = async (convo: Conversation) => {
    setActiveConvo(convo);
    await loadMessages(convo.user_id);
  };

  const searchUsers = (query: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

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
    if (!text.trim() || !activeConvo || !user || !pubKeyRef.current) return;
    
    setSending(true);
    const recipientId = activeConvo.user_id;
    const tempId = `tmp_${Date.now()}`;
    
    // Optimistic Update
    const tempMsg: Message = {
      id: tempId,
      from_user_id: user.id,
      to_user_id: recipientId,
      text,
      isMine: true,
      sentAt: new Date().toISOString(),
      status: "sending"
    };

    setMessages(prev => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), tempMsg]
    }));

    try {
      // 1. Get Recipient Public Key
      let rPubKey = pkCache.current[recipientId];
      if (!rPubKey) {
        const { public_key } = await ApiService.getPublicKey(recipientId, tokenRef.current);
        rPubKey = await CryptoService.importPublicKey(public_key);
        pkCache.current[recipientId] = rPubKey;
      }

      // 2. Encrypt
      const payload = await CryptoService.encrypt(text, rPubKey, pubKeyRef.current);

      // 3. Send
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: "message.send", to: recipientId, payload }));
      } else {
        await ApiService.sendMessage({ to: recipientId, payload }, tokenRef.current);
      }

      setMessages(prev => ({
        ...prev,
        [recipientId]: (prev[recipientId] || []).map(m => 
          m.id === tempId ? { ...m, status: "sent" } : m
        )
      }));
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [recipientId]: (prev[recipientId] || []).map(m => 
          m.id === tempId ? { ...m, status: "error" } : m
        )
      }));
    } finally {
      setSending(false);
    }
  };

  return {
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
  };
}
