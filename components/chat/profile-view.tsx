"use client";

import { User as UserIcon, Calendar, MessageSquare, Shield, Fingerprint, Lock, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";

interface ProfileViewProps {
  user: User | null;
}

export function ProfileView({ user }: ProfileViewProps) {
  const [copied, setCopied] = useState(false);
  const identityHash = "vlt_7729_x091_bc88_4af2";

  const handleCopy = () => {
    navigator.clipboard.writeText(identityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Authorized Since", value: "May 2024", icon: Calendar },
    { label: "Total Handshakes", value: "1,242", icon: MessageSquare },
    { label: "Security Tier", value: "Level 4", icon: Shield },
    { label: "Protocol Version", value: "V2.1.0", icon: Lock },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-10 bg-background/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <UserIcon size={14} className="text-foreground/60" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] uppercase tracking-[0.2em] text-foreground/90">Identity Profile</div>
            <div className="text-[8px] text-muted-foreground/30 font-bold uppercase tracking-[0.1em]">Authorized Node: KOYEB-FR-1</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-12 w-full py-12">
        {/* Profile Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group">
            <div className="absolute -inset-4 bg-foreground/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar name={user?.display_name} size={128} className="border-2 border-white/5 ring-8 ring-white/[0.02]" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center border-4 border-background">
              <Shield size={14} className="text-background" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-light tracking-tight text-foreground">{user?.display_name}</h1>
              <p className="text-[12px] text-muted-foreground/40 font-mono uppercase tracking-[0.3em]">@{user?.username}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground/30">ID:</span>
                <span className="text-[11px] font-mono text-foreground/70 tracking-tight">{identityHash}</span>
                <button onClick={handleCopy} className="text-muted-foreground/20 hover:text-foreground transition-colors">
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:bg-white/5 transition-all">
                Rotate Keys
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5">
                <s.icon size={18} className="text-foreground/30" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">{s.label}</div>
                <div className="text-lg font-light tracking-tight text-foreground/90">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <Fingerprint size={16} className="text-muted-foreground/40" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Cryptographic Identity</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">Public Key Fingerprint (SHA-256)</div>
                <div className="p-4 rounded-xl bg-black/40 font-mono text-[11px] text-muted-foreground/60 break-all leading-relaxed">
                  SHA256:f1:22:9a:4b:7c:01:8e:3d:4b:7c:01:8e:3d:4b:7c:01:8e:3d:4b:7c:01:8e:3d:4b:7c:01:8e:3d:4b:7c:01:8e
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Hardware Security Module Active
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-muted-foreground/40" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Vault Settings</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest group-hover:text-foreground">Session Auto-Lock</span>
                <span className="text-[10px] font-mono text-muted-foreground/30">15 MIN</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest group-hover:text-foreground">Incognito Mode</span>
                <div className="w-8 h-4 bg-white/10 rounded-full relative">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-foreground/20 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <span className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest group-hover:text-foreground">Data Sovereignty</span>
                <ExternalLink size={14} className="text-muted-foreground/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-2 opacity-20">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">WhisperBox Cryptographic Identity Profile</p>
          <p className="text-[8px] uppercase tracking-widest">Zero-Knowledge Architecture • Level 4 Clearance</p>
        </div>
      </div>
    </div>
  );
}
