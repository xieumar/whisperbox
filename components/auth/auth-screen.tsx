import { useState } from "react";
import { Lock, AlertCircle, Loader2, Eye, EyeOff, Shield, KeyRound } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  mode: "login" | "register";
  onMode: (mode: "login" | "register") => void;
  onLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  onRegister: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string;
}

export function AuthScreen({ mode, onMode, onLogin, onRegister, loading, error }: AuthScreenProps) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-[#060c19] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,rgba(37,99,235,0.14)_0%,transparent_65%)]">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_8px_48px_rgba(37,99,235,0.4),0_0_0_1px_rgba(37,99,235,0.2)]">
            <Lock size={28} className="text-white stroke-[2.5]" />
          </div>
          <h1 className="m-0 text-2xl font-extrabold text-[#eaf2ff] tracking-tight">WhisperBox</h1>
          <p className="mt-1.5 text-sm text-slate-400">End-to-end encrypted messaging</p>
        </div>

        <div className="bg-[#0b1628] border border-[#0f2040] rounded-[20px] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="flex bg-[#060c19] rounded-xl p-1 mb-6 gap-1">
            {(Object.entries({ login: "Sign In", register: "Create Account" }) as Array<["login" | "register", string]>).map(([m, lbl]) => (
              <button
                key={m} onClick={() => onMode(m)} type="button"
                className={cn(
                  "flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all",
                  mode === m
                    ? "bg-gradient-to-br from-[#0d2147] to-[#102858] text-blue-300 shadow-[0_1px_8px_rgba(37,99,235,0.2)]"
                    : "text-slate-400 hover:text-blue-300"
                )}
              >
                {lbl}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 flex items-start gap-2.5 text-[13px] text-red-400 leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={mode === "login" ? onLogin : onRegister} className="flex flex-col gap-4">
            {mode === "register" && (
              <InputField label="Display Name" name="display_name" placeholder="e.g. Alice Smith" required />
            )}
            <InputField label="Username" name="username" placeholder={mode === "register" ? "e.g. alice_92" : "Enter your username"} required />
            <InputField
              label="Password" name="password" required placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              type={showPw ? "text" : "password"}
              addon={
                <button type="button" onClick={() => setShowPw(!showPw)} className="hover:opacity-70 transition-opacity">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {mode === "register" && (
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 text-[12.5px] text-emerald-300/90 flex gap-2.5 leading-relaxed">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span>Your encryption keys are <strong>generated locally</strong> on this device. Only encrypted ciphertext ever reaches the server.</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="mt-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-80 rounded-xl py-3 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.38)] transition-all hover:-translate-y-[1px] disabled:hover:translate-y-0"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? (mode === "login" ? "Unwrapping keys…" : "Generating keys…") : (mode === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-[11px] text-[#0f2040] flex items-center justify-center gap-1.5">
          <KeyRound size={10} />
          AES-256-GCM · RSA-OAEP-2048 · PBKDF2-SHA256
        </div>
      </div>
    </div>
  );
}