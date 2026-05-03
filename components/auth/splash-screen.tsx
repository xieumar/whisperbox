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
      {/* Concentric Circles Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="absolute w-[300px] h-[300px] border border-foreground rounded-full" />
        <div className="absolute w-[500px] h-[500px] border border-foreground rounded-full" />
        <div className="absolute w-[700px] h-[700px] border border-foreground rounded-full" />
        <div className="absolute w-[900px] h-[900px] border border-foreground rounded-full" />
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-[400px] w-full">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Shield size={48} className="text-foreground stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-[0.2em] uppercase">Vault</h1>
            <p className="text-muted-foreground text-sm tracking-widest uppercase">Quiet Security.</p>
          </div>
        </div>

        <div className="w-full space-y-4 pt-12">
          <button
            onClick={onGetStarted}
            className="w-full bg-foreground text-background rounded-full py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={16} />
          </button>
          
          <button
            onClick={onRestore}
            className="w-full bg-transparent border border-foreground/10 text-foreground/60 rounded-full py-4 px-6 font-medium text-sm hover:bg-foreground/5 hover:text-foreground transition-all"
          >
            Restore Account
          </button>
        </div>

        <div className="pt-24 flex flex-col items-center space-y-2 opacity-30">
          <div className="w-4 h-4 border-2 border-foreground rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-foreground rounded-full" />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase">Secure Session Ready</span>
        </div>
      </div>
    </div>
  );
}
