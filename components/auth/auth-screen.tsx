"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, AlertCircle, Loader2, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  username: z.string().min(1, "Identifier is required").min(3, "Identifier must be at least 3 characters"),
  password: z.string().min(1, "Passphrase is required").min(8, "Passphrase must be at least 8 characters"),
});

const registerSchema = z.object({
  display_name: z.string().min(1, "Display name is required"),
  username: z.string()
    .min(1, "Identifier is required")
    .min(3, "Identifier must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use only letters, numbers, underscores, or hyphens"),
  password: z.string().min(1, "Passphrase is required").min(8, "Passphrase must be at least 8 characters"),
});

type AuthFormValues = {
  display_name?: string;
  username: string;
  password: string;
};

interface AuthScreenProps {
  mode: "login" | "register";
  onLogin?: (data: any) => void;
  onRegister?: (data: any) => void;
  loading: boolean;
  error: string;
}

export function AuthScreen({ mode, onLogin, onRegister, loading, error }: AuthScreenProps) {
  const [showPw, setShowPw] = useState(false);

  const {
    register: regField,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmit = (data: any) => {
    if (mode === "login") {
      onLogin?.(data);
    } else {
      onRegister?.(data);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Concentric Circles Background - Dimmed & Technical */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none">
        <div className="absolute w-[300px] h-[300px] border border-foreground rounded-full animate-deep-pulse" />
        <div className="absolute w-[500px] h-[500px] border border-foreground rounded-full animate-deep-pulse [animation-delay:0.5s]" />
        <div className="absolute w-[700px] h-[700px] border border-foreground rounded-full animate-deep-pulse [animation-delay:1s]" />
      </div>

      <div className="w-full max-w-[400px] z-10 flex flex-col space-y-12">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 flex items-center justify-center mx-auto">
            <div className="absolute inset-0 border border-foreground/10 rounded-full animate-[ping_3s_linear_infinite]" />
            <div className="absolute inset-2 border border-foreground/5 rounded-full" />
            <Shield size={44} className="text-white/40 stroke-[1] fill-foreground/20" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-[20px] font-semibold uppercase tracking-[0.5em] text-white pl-1.5">Vault</h1>
            <p className="text-muted-foreground/30 text-[8px] font-bold tracking-[0.2em] uppercase">
              {mode === "register" ? "Initialize your secure environment." : "Access your secure environment."}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3 text-[11px] text-destructive leading-relaxed animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              {mode === "register" && (
                <InputField
                  label="Display Name"
                  placeholder="Choose a display name"
                  error={errors.display_name?.message as string}
                  {...regField("display_name")}
                />
              )}
              
              <InputField
                label="Identifier"
                placeholder="Choose an alias"
                addon={<User size={18} className="opacity-20" />}
                error={errors.username?.message as string}
                {...regField("username")}
              />
              
              <InputField
                label="Passphrase"
                placeholder="Master key"
                type={showPw ? "text" : "password"}
                error={errors.password?.message as string}
                {...regField("password")}
                addon={
                  <button type="button" onClick={() => setShowPw(!showPw)} className="hover:opacity-70 transition-opacity">
                    {showPw ? <EyeOff size={18} className="opacity-20" /> : <Eye size={18} className="opacity-20" />}
                  </button>
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background rounded-full py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-white/5"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? (mode === "login" ? "Accessing..." : "Generating...") : (
                <div className="flex items-center gap-2">
                  {mode === "login" ? "Open Vault" : "Generate Identity"}
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>

          <div className="text-center">
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors"
            >
              {mode === "login" ? "Need a new identity?" : "Already have an identity?"}
            </Link>
          </div>
        </div>

       
      </div>
    </div>
  );
}