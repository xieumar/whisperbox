"use client";

import { AuthScreen } from "@/components/auth/auth-screen";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { login, loading, error, phase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (phase === "app") {
      router.push("/");
    }
  }, [phase, router]);

  return (
    <AuthScreen 
      mode="login" 
      onLogin={login} 
      loading={loading} 
      error={error} 
    />
  );
}
