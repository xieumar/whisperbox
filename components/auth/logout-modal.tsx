"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-secondary border border-white/5 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner">
            <AlertTriangle size={36} className="text-muted-foreground/30" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold uppercase tracking-[0.3em] text-foreground">Terminate Session?</h2>
            <p className="text-[11px] text-muted-foreground/40 leading-relaxed uppercase tracking-widest font-bold">
              Are you sure you want to log out? Your secure end-to-end encrypted channel will be closed immediately.
            </p>
          </div>

          <div className="flex flex-col w-full gap-3 pt-4">
            <button 
              onClick={onConfirm}
              className="w-full bg-foreground text-background py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={16} />
              Terminate Session
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white/5 text-muted-foreground py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              Back to Operations
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
