"use client";

import { Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onGetStarted: () => void;
  onRestore: () => void;
}

export function SplashScreen({ onGetStarted, onRestore }: SplashScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
        <div className="absolute w-[400px] h-[400px] border border-foreground rounded-full animate-deep-pulse" />
        <div className="absolute w-[600px] h-[600px] border border-foreground rounded-full animate-deep-pulse [animation-delay:0.5s]" />
        <div className="absolute w-[850px] h-[850px] border border-foreground rounded-full animate-deep-pulse [animation-delay:1s]" />
        <div className="absolute w-[1100px] h-[1100px] border border-foreground rounded-full animate-deep-pulse [animation-delay:1.5s]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center space-y-12 max-w-[340px] w-full">
        <div className="space-y-6">
          <div className="relative w-28 h-28 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 border border-foreground/10 rounded-full animate-[ping_3s_linear_infinite]" />
            <div className="absolute inset-3 border border-foreground/5 rounded-full" />
            <Shield size={52} className="text-foreground/40 stroke-[1] fill-foreground/20" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-[20px] font-semibold uppercase tracking-[0.6em] text-foreground/60 pl-2">Vault</h1>
            <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.3em] leading-relaxed">
              Quiet Security. Persistent Encryption.
            </p>
          </div>
        </div>

        <div className="w-full space-y-3 pt-6">
          <button
            onClick={onGetStarted}
            className="w-full bg-white/[0.03] border border-white/10 text-foreground/80 rounded-full py-4 px-6 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-foreground hover:text-background transition-all duration-500 group"
          >
            Initialize Handshake 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onRestore}
            className="w-full bg-transparent border border-white/5 text-muted-foreground/20 rounded-full py-4 px-6 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-foreground/40 hover:bg-white/[0.01] transition-all duration-300"
          >
            Restore Session
          </button>
        </div>

      </div>
    </div>
  );
}
