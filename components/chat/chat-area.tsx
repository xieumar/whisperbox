import { Lock, Shield, Loader2, CheckCheck, Clock, AlertCircle, Send } from "lucide-react";
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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-18 h-18 bg-[#0b1628] rounded-2xl flex items-center justify-center border border-[#0c1e36] shadow-2xl">
          <Lock size={30} className="text-blue-600" />
        </div>
        <div className="text-center">
          <h2 className="m-0 mb-1.5 text-xl font-bold text-slate-400">WhisperBox</h2>
          <p className="m-0 text-[13px] max-w-[270px] leading-relaxed">Select a conversation from the sidebar, or search for users to start a new secure chat.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/5 border border-green-500/10 rounded-lg py-1.5 px-3">
          <Shield size={12} className="text-green-500" />
          <span className="text-[11px] text-green-500">All messages are end-to-end encrypted</span>
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
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-3 px-5 border-b border-[#0c1e36] flex items-center gap-3 bg-[#0b1628]">
        <Avatar name={activeConvo.display_name} size={38} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] text-[#eaf2ff] mb-0.5">{activeConvo.display_name}</div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1">
            <Lock size={9} className="stroke-[2.5]" /> End-to-end encrypted
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-md py-1 px-2.5">
          <Shield size={11} className="text-green-500" />
          <span className="text-[10px] text-green-500 font-semibold tracking-wider">ENCRYPTED</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 px-5 flex flex-col custom-scrollbar">
        {msgLoading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 size={24} className="text-slate-600 animate-spin" /></div>
        ) : grouped.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-[#0b1628] rounded-2xl flex items-center justify-center border border-[#0c1e36]">
              <Lock size={24} className="text-blue-600" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-400 mb-1">Conversation is encrypted</div>
              <div className="text-xs text-slate-500">Say hello to {activeConvo.display_name} 👋</div>
            </div>
          </div>
        ) : (
          <>
            {grouped.map((item) => {
              if (item.type === "date") {
                return (
                  <div key={item.key} className="text-center my-2.5">
                    <span className="text-[11px] text-slate-400 bg-[#0b1628] px-3 py-1 rounded-full font-medium">{item.label}</span>
                  </div>
                );
              }

              const { msg, isFirst, isLast } = item;
              const isMine = msg.isMine;

              return (
                <div key={item.key} className={cn("flex", isMine ? "justify-end" : "justify-start", isLast ? "mb-2" : "mb-0.5")}>
                  {!isMine && (
                    <div className="w-6.5 mr-2 self-end mb-0.5 shrink-0">
                      {isLast && <Avatar name={activeConvo.display_name} size={24} />}
                    </div>
                  )}
                  <div className="max-w-[66%]">
                    <div
                      className={cn(
                        "px-3.5 py-2 text-sm leading-relaxed break-words shadow-sm transition-opacity",
                        isMine
                          ? msg.status === "error"
                            ? "bg-red-950/50 text-red-300 border border-red-500/40"
                            : "bg-gradient-to-br from-blue-700 to-blue-600 text-[#dde8f5] shadow-blue-700/20"
                          : "bg-[#0f1e33] text-[#dde8f5]",
                        isMine
                          ? isFirst && isLast ? "rounded-[16px_4px_16px_16px]" : isFirst ? "rounded-[16px_4px_4px_16px]" : isLast ? "rounded-[4px_4px_16px_16px]" : "rounded-[4px]"
                          : isFirst && isLast ? "rounded-[4px_16px_16px_16px]" : isFirst ? "rounded-[4px_16px_4px_4px]" : isLast ? "rounded-[4px_4px_16px_16px]" : "rounded-[4px]",
                        msg.status === "sending" && "opacity-60"
                      )}
                    >
                      {msg.text}
                    </div>
                    {isLast && (
                      <div className={cn("flex items-center gap-1 mt-1 px-1", isMine ? "justify-end" : "justify-start")}>
                        <span className="text-[10px] text-slate-500">{fmtTime(msg.sentAt)}</span>
                        {isMine && (
                          msg.status === "sending" ? <Clock size={10} className="text-slate-500" /> :
                          msg.status === "error" ? <AlertCircle size={10} className="text-red-500" /> :
                          <CheckCheck size={10} className="text-blue-500" />
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

      <div className="p-2.5 px-4 pb-3.5 border-t border-[#0c1e36] bg-[#0b1628]">
        <div className="flex items-end gap-2 bg-[#09111e] rounded-xl p-2 pl-4 border border-[#0f2040] focus-within:border-blue-700 transition-colors">
          <textarea
            ref={inputRef} value={input}
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message…" rows={1}
            className="flex-1 bg-transparent border-none text-[#dde8f5] text-sm resize-none font-sans leading-relaxed max-h-[110px] min-h-[22px] overflow-y-auto p-0 outline-none placeholder:text-slate-600 custom-scrollbar"
          />
          <button
            onClick={handleSend} disabled={!input.trim() || sending}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all",
              input.trim() ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:scale-105" : "bg-[#0f1e33] text-slate-500 cursor-default"
            )}
          >
            {sending ? <Loader2 size={15} className="animate-spin text-white" /> : <Send size={15} />}
          </button>
        </div>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <Lock size={8} className="text-slate-600" />
          <span className="text-[10px] text-slate-600">Messages are encrypted with AES-256-GCM before leaving your device</span>
        </div>
      </div>
    </div>
  );
}