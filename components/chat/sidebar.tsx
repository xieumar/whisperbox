"use client";

import { useState } from "react";
import { 
  Search, X, Loader2, MessageSquare, LogOut, 
  Wifi, WifiOff, Shield, Lock, Settings, User as UserIcon,
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";
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

type Tab = "chats" | "security" | "profile";

export function Sidebar(props: SidebarProps) {
  const { 
    user, wsStatus, doLogout, searchQ, handleSearchChange, 
    showSearch, setShowSearch, searching, searchResults, 
    setSearchResults, setSearchQ, convos, activeId, 
    messages, selectConvo 
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
          isActive ? "bg-white/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
          isCollapsed ? "justify-center" : "justify-start"
        )}
        title={isCollapsed ? label : undefined}
      >
        <Icon size={18} className={cn(isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
        {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-[0.15em]">{label}</span>}
        {isActive && !isCollapsed && (
          <div className="absolute left-0 w-1 h-4 bg-foreground rounded-r-full" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed bottom-30 right-4 z-50 w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center shadow-2xl"
      >
        <Menu size={24} />
      </button>

      <div className={cn(
        "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity",
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileOpen(false)} />

      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-40 bg-background border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-foreground" />
              <span className="text-sm font-light tracking-[0.2em] uppercase">Vault</span>
            </div>
          )}
          {isCollapsed && <Shield size={20} className="mx-auto text-foreground" />}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 space-y-2 mb-6">
          <NavItem id="chats" label="Chats" icon={MessageSquare} />
          <NavItem id="security" label="Security" icon={Lock} />
          <NavItem id="profile" label="Profile" icon={UserIcon} />
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === "chats" && (
            <>
              {/* Search */}
              {!isCollapsed && (
                <div className="px-4 mb-4">
                  <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none transition-colors group-focus-within:text-foreground" />
                    <input
                      value={searchQ} onChange={(e) => handleSearchChange(e.target.value)} onFocus={() => setShowSearch(true)}
                      placeholder="Search..."
                      className="w-full bg-secondary/30 border border-white/5 rounded-xl py-2.5 pl-9 pr-8 text-foreground text-[12px] outline-none transition-all focus:border-white/10 placeholder:text-muted-foreground/20"
                    />
                    {searchQ && (
                      <button onClick={() => { setSearchQ(""); setSearchResults([]); setShowSearch(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Convos / Search Results */}
              <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                {showSearch && searchQ ? (
                  <>
                    {!isCollapsed && <div className="px-4 py-2 text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Found</div>}
                    {searching ? (
                      <div className="p-5 flex justify-center"><Loader2 size={18} className="text-muted-foreground/20 animate-spin" /></div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-muted-foreground/50 uppercase tracking-widest">Zero Results</div>
                    ) : (
                      searchResults.map((u) => (
                        <button 
                          key={u.id} 
                          onClick={() => { selectConvo({ user_id: u.id, username: u.username, display_name: u.display_name }); setIsMobileOpen(false); }} 
                          className={cn(
                            "w-full rounded-xl hover:bg-white/5 p-2 flex items-center gap-3 text-left transition-all group",
                            isCollapsed ? "justify-center" : "px-3"
                          )}
                        >
                          <Avatar name={u.display_name} size={isCollapsed ? 36 : 32} />
                          {!isCollapsed && (
                            <div className="min-w-0">
                              <div className="font-bold text-[12px] uppercase tracking-wider">{u.display_name}</div>
                              <div className="text-[10px] text-muted-foreground/50">@{u.username}</div>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    {!isCollapsed && <div className="px-4 py-2 text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Messages</div>}
                    {convos.length === 0 ? (
                      !isCollapsed && (
                        <div className="p-8 text-center text-muted-foreground/20 space-y-3">
                          <MessageSquare size={32} className="mx-auto opacity-50" />
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em]">Void</div>
                        </div>
                      )
                    ) : (
                      convos.map((c) => {
                        const isActive = activeId === c.user_id;
                        const lastMsg = (messages[c.user_id] || []).slice(-1)[0];
                        return (
                          <div 
                            key={c.user_id} 
                            onClick={() => { selectConvo(c); setIsMobileOpen(false); }} 
                            className={cn(
                              "relative group rounded-xl p-2 flex items-center gap-3 cursor-pointer transition-all",
                              isActive ? "bg-white/5" : "hover:bg-white/5",
                              isCollapsed ? "justify-center" : "px-3"
                            )}
                          >
                            <Avatar name={c.display_name} size={isCollapsed ? 40 : 36} />
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                  <span className={cn("font-bold text-[12px] uppercase tracking-wider", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{c.display_name}</span>
                                  <span className="text-[9px] text-muted-foreground/30 font-medium">{fmtTime(c.last_message_at)}</span>
                                </div>
                                <div className="text-[11px] text-muted-foreground/50 truncate tracking-tight">
                                  {lastMsg ? (lastMsg.isMine ? "OUT: " + lastMsg.text : "IN: " + lastMsg.text) : "READY"}
                                </div>
                              </div>
                            )}
                            {isActive && !isCollapsed && (
                              <div className="absolute left-0 w-1 h-6 bg-foreground rounded-r-full" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Lock size={32} className="opacity-10" />
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">E2EE Protocol Active</p>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="flex-1 p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar name={user?.display_name} size={64} />
                <div className="text-center">
                  <h3 className="font-bold text-sm uppercase tracking-widest">{user?.display_name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">@{user?.username}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 mt-auto space-y-4">
          <div className={cn(
            "p-3 rounded-2xl bg-secondary/20 flex items-center gap-3 transition-all",
            isCollapsed ? "justify-center" : ""
          )}>
            <div className="relative">
              <Avatar name={user?.display_name} size={28} />
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background",
                wsStatus === "connected" ? "bg-emerald-500" : wsStatus === "connecting" ? "bg-amber-500" : "bg-red-500"
              )} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold truncate uppercase tracking-widest">{user?.display_name}</div>
                <div className="text-[9px] text-muted-foreground/50 uppercase font-medium">Session Active</div>
              </div>
            )}
            {!isCollapsed && (
              <button onClick={doLogout} className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-all">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}