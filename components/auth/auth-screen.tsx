"use client";

import { useState } from "react";
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
  onMode: (mode: "login" | "register") => void;
  onLogin: (data: any) => void;
  onRegister: (data: any) => void;
  loading: boolean;
  error: string;
}

export function AuthScreen({ mode, onMode, onLogin, onRegister, loading, error }: AuthScreenProps) {
  const [showPw, setShowPw] = useState(false);

  const {
    register: regField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmit = (data: any) => {
    if (mode === "login") {
      onLogin(data);
    } else {
      onRegister(data);
    }
  };

  const toggleMode = () => {
    reset();
    onMode(mode === "login" ? "register" : "login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Concentric Circles Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <div className="absolute w-[300px] h-[300px] border border-foreground rounded-full" />
        <div className="absolute w-[500px] h-[500px] border border-foreground rounded-full" />
        <div className="absolute w-[700px] h-[700px] border border-foreground rounded-full" />
      </div>

      <div className="w-full max-w-[400px] z-10 flex flex-col space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield size={40} className="text-foreground opacity-80" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-light tracking-[0.2em] uppercase">Vault</h1>
            <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
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
            <button
              type="button"
              onClick={toggleMode}
              className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] hover:text-foreground transition-colors"
            >
              {mode === "login" ? "Need a new identity?" : "Already have an identity?"}
            </button>
          </div>
        </div>

       
      </div>
    </div>
  );
}