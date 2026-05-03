import { Search, X, Loader2, MessageSquare, LogOut, Wifi, WifiOff, Shield, Lock } from "lucide-react";
import { User, Conversation, Message } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { cn, fmtTime } from "@/lib/utils";

interface SidebarProps {
  user: User | null;
  wsStatus: "connected" | "connecting" | "disconnected";
  doLogout: () => void;
  searchQ: string;
  handleSearchChange: (q: string) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searching: boolean;
  searchResults: User[];
  setSearchResults: (results: User[]) => void;
  setSearchQ: (q: string) => void;
  convos: Conversation[];
  activeId?: string;
  messages: Record<string, Message[]>;
  selectConvo: (convo: Partial<Conversation> & { user_id: string }) => void;
}

export function Sidebar(props: SidebarProps) {
  const { user, wsStatus, doLogout, searchQ, handleSearchChange, showSearch, setShowSearch, searching, searchResults, setSearchResults, setSearchQ, convos, activeId, messages, selectConvo } = props;

  return (
    <div className="w-[300px] bg-[#0b1628] border-r border-[#0c1e36] flex flex-col shrink-0">
      <div className="p-4 pb-3 border-b border-[#0c1e36]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Lock size={15} className="text-white stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#eaf2ff]">WhisperBox</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div title={`Connection: ${wsStatus}`} className="flex items-center">
              {wsStatus === "connected" ? <Wifi size={14} className="text-green-500" />
                : wsStatus === "connecting" ? <Loader2 size={14} className="text-amber-500 animate-spin" />
                : <WifiOff size={14} className="text-red-500" />}
            </div>
            <button onClick={doLogout} title="Sign out" className="text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 p-1.5 rounded-md transition-all">
              <LogOut size={14} />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
          <input
            value={searchQ} onChange={(e) => handleSearchChange(e.target.value)} onFocus={() => setShowSearch(true)}
            placeholder="Search users…"
            className="w-full bg-[#09111e] border border-[#0c1e36] rounded-xl py-2 pl-8 pr-8 text-[#dde8f5] text-[13px] outline-none transition-all focus:border-blue-700 focus:bg-[#0c1628] placeholder:text-slate-600"
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(""); setSearchResults([]); setShowSearch(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {showSearch && searchQ ? (
          <>
            <div className="px-3.5 pt-2.5 pb-1 text-[10px] text-slate-500 font-bold tracking-widest uppercase">Find Users</div>
            {searching ? (
              <div className="p-5 flex justify-center"><Loader2 size={18} className="text-slate-500 animate-spin" /></div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-[13px] text-slate-500">No users found</div>
            ) : (
              searchResults.map((u) => (
                <button key={u.id} onClick={() => selectConvo({ user_id: u.id, username: u.username, display_name: u.display_name })} className="w-full bg-transparent hover:bg-[#0b1c36] p-2.5 px-3.5 flex items-center gap-2.5 text-left text-[#dde8f5] transition-colors">
                  <Avatar name={u.display_name} size={36} />
                  <div>
                    <div className="font-semibold text-[13px]">{u.display_name}</div>
                    <div className="text-[11px] text-slate-400">@{u.username}</div>
                  </div>
                </button>
              ))
            )}
          </>
        ) : (
          <>
            <div className="px-3.5 pt-2.5 pb-1 text-[10px] text-slate-500 font-bold tracking-widest uppercase">Conversations</div>
            {convos.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <MessageSquare size={30} className="mx-auto mb-2.5" />
                <div className="text-[13px] font-medium mb-1">No conversations yet</div>
                <div className="text-xs">Search for users above to start chatting</div>
              </div>
            ) : (
              convos.map((c) => {
                const isActive = activeId === c.user_id;
                const lastMsg = (messages[c.user_id] || []).slice(-1)[0];
                return (
                  <div key={c.user_id} onClick={() => selectConvo(c)} className={cn("p-2.5 px-3.5 flex items-center gap-2.5 cursor-pointer transition-colors border-l-2", isActive ? "bg-[#0e2145] border-blue-600" : "hover:bg-[#0b1c36] border-transparent")}>
                    <Avatar name={c.display_name} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={cn("font-semibold text-[13.5px]", isActive ? "text-blue-300" : "text-[#dde8f5]")}>{c.display_name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0 ml-1">{fmtTime(c.last_message_at)}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {lastMsg ? (lastMsg.isMine ? "You: " + lastMsg.text : lastMsg.text) : "…"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <div className="p-2.5 px-3.5 border-t border-[#0c1e36] flex items-center gap-2.5">
        <Avatar name={user?.display_name} size={28} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-[#c4d9f0]">{user?.display_name}</div>
          <div className="text-[10px] text-slate-500">@{user?.username}</div>
        </div>
        <div className="flex items-center gap-1 opacity-50" title="End-to-end encrypted">
          <Shield size={11} className="text-green-500" />
        </div>
      </div>
    </div>
  );
}