"use client";

import { Lock, Shield, Loader2, CheckCheck, Clock, AlertCircle, Send, Terminal } from "lucide-react";
import { Conversation, Message } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, fmtTime, fmtDate } from "@/lib/utils";

interface ChatAreaProps {
  activeConvo: Conversation | null;
  messages: Record<string, Message[]>;
  msgLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  sending: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatArea(props: ChatAreaProps) {
  const { activeConvo, messages, msgLoading, input, setInput, handleSend, sending, bottomRef, inputRef } = props;

  if (!activeConvo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Subtle operative grid background or concentric circles */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none">
          <div className="absolute w-[400px] h-[400px] border border-foreground rounded-full" />
          <div className="absolute w-[600px] h-[600px] border border-foreground rounded-full" />
        </div>

        <div className="z-10 flex flex-col items-center gap-10 max-w-[320px] text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 border border-foreground/10 rounded-full animate-[ping_3s_linear_infinite]" />
            <div className="absolute inset-2 border border-foreground/5 rounded-full" />
            <Shield size={44} className="text-foreground/40 stroke-[1]" />
          </div>
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground/40">Secure Session Pending</h2>
            <p className="text-[10px] text-muted-foreground/30 leading-relaxed uppercase tracking-[0.2em] px-6">
              Establish a handshake by selecting an identity from the vault registry.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full py-1.5 px-5">
            <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] text-emerald-500/60 font-bold uppercase tracking-[0.25em]">AES-256-GCM Active</span>
          </div>
        </div>
      </div>
    );
  }

  const activeMessages = messages[activeConvo.user_id] || [];
  const grouped: any[] = [];
  let lastDate: string | null = null;
  
  for (let i = 0; i < activeMessages.length; i++) {
    const msg = activeMessages[i];
    const dateStr = fmtDate(msg.sentAt);
    if (dateStr !== lastDate) { grouped.push({ type: "date", label: dateStr, key: `d_${i}` }); lastDate = dateStr; }
    const prevMsg = i > 0 ? activeMessages[i - 1] : null;
    const nextMsg = i < activeMessages.length - 1 ? activeMessages[i + 1] : null;
    const isFirst = !prevMsg || prevMsg.isMine !== msg.isMine || fmtDate(prevMsg.sentAt) !== dateStr;
    const isLast = !nextMsg || nextMsg.isMine !== msg.isMine || fmtDate(nextMsg.sentAt) !== fmtDate(msg.sentAt);
    grouped.push({ type: "msg", msg, isFirst, isLast, key: msg.id });
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background relative">
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-10 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Avatar name={activeConvo.display_name} size={28} />
          <div className="min-w-0">
            <div className="font-bold text-[11px] uppercase tracking-[0.15em] text-foreground/90">{activeConvo.display_name}</div>
            <div className="text-[8px] text-emerald-500/50 flex items-center gap-1.5 font-bold uppercase tracking-[0.2em]">
              <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Encrypted Identity
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">Session Hash</span>
            <span className="text-[10px] font-mono text-muted-foreground/20">VLT-7729-001X</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center border border-white/5">
            <Terminal size={14} className="text-muted-foreground/30" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {msgLoading ? (
          <div className="flex-1 h-full flex items-center justify-center">
            <Loader2 size={24} className="text-muted-foreground/10 animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex-1 h-full flex flex-col items-center justify-center space-y-6 opacity-20">
            <Lock size={40} className="stroke-[1]" />
            <div className="text-center space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em]">Channel Encrypted</div>
              <div className="text-[9px] uppercase tracking-widest">Zero knowledge persistent</div>
            </div>
          </div>
        ) : (
          <>
            {grouped.map((item) => {
              if (item.type === "date") {
                return (
                  <div key={item.key} className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-[1px] bg-white/5" />
                    <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">{item.label}</span>
                    <div className="flex-1 h-[1px] bg-white/5" />
                  </div>
                );
              }

              const { msg, isFirst, isLast } = item;
              const isMine = msg.isMine;

              return (
                <div key={item.key} className={cn("flex group", isMine ? "justify-end" : "justify-start", isLast ? "mb-6" : "mb-1.5")}>
                  {!isMine && (
                    <div className="w-8 mr-3 self-end mb-1 shrink-0">
                      {isLast && <Avatar name={activeConvo.display_name} size={24} />}
                    </div>
                  )}
                  <div className={cn("max-w-[75%] lg:max-w-[60%]", isMine ? "items-end" : "items-start", "flex flex-col")}>
                    <div
                      className={cn(
                        "px-3.5 py-2.5 text-[12.5px] leading-relaxed break-words transition-all border",
                        isMine
                          ? msg.status === "error"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-white/[0.03] text-foreground border-white/5"
                          : "bg-white/[0.01] text-foreground/80 border-white/5",
                        isMine
                          ? "rounded-xl rounded-tr-none"
                          : "rounded-xl rounded-tl-none",
                        msg.status === "sending" && "opacity-30"
                      )}
                    >
                      {msg.text}
                    </div>
                    {isLast && (
                      <div className={cn("flex items-center gap-1.5 mt-1 px-1", isMine ? "justify-end" : "justify-start")}>
                        <span className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">{fmtTime(msg.sentAt)}</span>
                        {isMine && (
                          msg.status === "sending" ? <Clock size={8} className="text-muted-foreground/10" /> :
                          msg.status === "error" ? <AlertCircle size={8} className="text-destructive/50" /> :
                          <CheckCheck size={9} className="text-emerald-500/20" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="p-6 pt-2">
        <div className="relative flex items-end gap-2 bg-white/[0.02] rounded-xl border border-white/5 p-1.5 focus-within:border-white/10 transition-all">
          <textarea
            ref={inputRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Authorized input only..." rows={1}
            className="flex-1 bg-transparent border-none text-foreground text-[12px] resize-none leading-relaxed max-h-[160px] min-h-[40px] overflow-y-auto px-4 py-2.5 outline-none placeholder:text-muted-foreground/10 custom-scrollbar"
          />
          <button
            onClick={handleSend} disabled={!input.trim() || sending}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all",
              input.trim() ? "bg-foreground text-background shadow-lg hover:opacity-90" : "bg-white/[0.02] text-muted-foreground/10 cursor-default"
            )}
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 px-4 opacity-10">
          <Shield size={10} />
          <span className="text-[8px] font-bold uppercase tracking-[0.2em]">End-to-End Encryption Protocol Active</span>
        </div>
      </div>
    </div>
  );
}