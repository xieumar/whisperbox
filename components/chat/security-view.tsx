"use client";

import { Shield, Activity, Fingerprint, Key, Globe, Lock, RefreshCw, Cpu, Database, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types";

interface SecurityViewProps {
  user: User | null;
}

export function SecurityView({ user }: SecurityViewProps) {
  const securityMetrics = [
    { label: "Protocol", value: "AES-256-GCM", icon: Shield, status: "Active" },
    { label: "Handshake", value: "ECDH P-256", icon: Activity, status: "Secure" },
    { label: "Key Status", value: "Rotated 2h ago", icon: RefreshCw, status: "Healthy" },
    { label: "Identity Hash", value: "0x7F...9A42", icon: Fingerprint, status: "Verified" },
  ];

  const logs = [
    { event: "Channel Handshake Established", target: "ID: 992-X", time: "12:04:11" },
    { event: "Ephemeral Key Rotation", target: "SYSTEM", time: "11:58:02" },
    { event: "New Authorized Login", target: "IP: 192.168.1.1", time: "10:45:30" },
    { event: "Vault Encrypted Storage Sync", target: "KOYEB-DB", time: "09:12:45" },
    { event: "Zero-Knowledge Proof Verified", target: "AUTH-PROV", time: "08:33:12" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-10 bg-background/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center">
            <Lock size={14} className="text-foreground/60" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[11px] uppercase tracking-[0.2em] text-foreground/90">Security Dashboard</div>
            <div className="text-[8px] text-muted-foreground/30 font-bold uppercase tracking-[0.1em]">Protocol: VLT-E2EE-01</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 w-full">
        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityMetrics.map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 group hover:border-white/10 transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 group-hover:scale-110 transition-transform">
                  <m.icon size={16} className="text-foreground/40" />
                </div>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[8px] text-emerald-500/80 font-bold uppercase tracking-widest">{m.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{m.label}</div>
                <div className="text-[12px] font-mono text-foreground/80 tracking-tight">{m.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Monitor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-white/[0.01] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-muted-foreground/40" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Real-time Monitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest">Core Synchronized</span>
                </div>
              </div>
              
              <div className="h-48 flex items-end gap-1 px-2 pb-4 border-b border-white/5">
                {[...Array(32)].map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-foreground/5 rounded-t-sm hover:bg-foreground/20 transition-colors"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">CPU Load</div>
                  <div className="text-[11px] font-mono">0.02%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">Latency</div>
                  <div className="text-[11px] font-mono">14ms</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">Entropy</div>
                  <div className="text-[11px] font-mono">99.9%</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Server size={14} className="text-muted-foreground/40" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Authorized Nodes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <Database size={14} className="text-emerald-500/60" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider">Storage Node</div>
                      <div className="text-[8px] text-muted-foreground/30 uppercase tracking-widest">Encrypted Shards</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-emerald-500/60">ONLINE</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Globe size={14} className="text-blue-500/60" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider">Gateway</div>
                      <div className="text-[8px] text-muted-foreground/30 uppercase tracking-widest">WebSocket Edge</div>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-blue-500/60">SYNCING</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Log */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Activity size={14} className="text-muted-foreground/40" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Security Protocol Logs</span>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex-1 divide-y divide-white/5">
              {logs.map((l, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="text-[10px] font-bold text-foreground/80 leading-tight">{l.event}</div>
                    <div className="text-[8px] font-mono text-muted-foreground/20 shrink-0">{l.time}</div>
                  </div>
                  <div className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.1em]">{l.target}</div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-3 rounded-xl bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-opacity">
              Export Audit Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
