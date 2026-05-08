"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { User } from "@/lib/types";
import { CryptoService, base64Encode } from "@/lib/crypto";
import { ApiService } from "@/lib/api";
import { storeKeys, loadKeys, clearKeys } from "@/lib/key-store";

export type AuthPhase = "auth" | "app";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  phase: AuthPhase;
  loading: boolean;
  initialized: boolean;
  error: string;
  privateKey: CryptoKey | null;
  publicKey: CryptoKey | null;
  register: (data: any) => Promise<void>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setError: (err: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<AuthPhase>("auth");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");

  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);

  const initSession = useCallback(async (data: any, priv: CryptoKey, pub: CryptoKey) => {
    setPrivateKey(priv);
    setPublicKey(pub);
    setUser(data.user);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setPhase("app");

    localStorage.setItem("wb_user", JSON.stringify(data.user));
    localStorage.setItem("wb_at", data.access_token);
    localStorage.setItem("wb_rt", data.refresh_token);

    // Persist CryptoKey objects in IndexedDB so they survive page refreshes
    try { await storeKeys(priv, pub); } catch (e) { console.error("[AuthContext] Failed to persist keys", e); }
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = localStorage.getItem("wb_user");
        const at = localStorage.getItem("wb_at");
        const rt = localStorage.getItem("wb_rt");

        if (storedUser && at && rt) {
          setUser(JSON.parse(storedUser));
          setAccessToken(at);
          setRefreshToken(rt);

          // Try to restore CryptoKey objects from IndexedDB
          const keys = await loadKeys();
          if (keys) {
            setPrivateKey(keys.privateKey);
            setPublicKey(keys.publicKey);
            setPhase("app");
          }
          // If keys are missing, stay on "auth" so user can re-enter passphrase
        }
      } catch (e) {
        console.error("[AuthContext] Restore failed", e);
      } finally {
        setInitialized(true);
      }
    };
    restoreSession();
  }, []);

  const handleRegister = async (authData: any) => {
    setLoading(true);
    setError("");
    try {
      const { username, display_name, password } = authData;
      
      const keyPair = await CryptoService.generateKeyPair();
      const salt = CryptoService.generateSalt();
      const wrappingKey = await CryptoService.deriveWrappingKey(password, salt.buffer as ArrayBuffer);
      
      const [wrappedPK, publicB64] = await Promise.all([
        CryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey),
        CryptoService.exportPublicKey(keyPair.publicKey),
      ]);

      const response = await ApiService.register({
        username: username.trim(),
        display_name: display_name.trim(),
        password,
        public_key: publicB64,
        wrapped_private_key: wrappedPK,
        pbkdf2_salt: base64Encode(salt.buffer as ArrayBuffer),
      });

      await initSession(response, keyPair.privateKey, keyPair.publicKey);
    } catch (err: any) {
      console.error("[AuthContext] Register error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (authData: any) => {
    setLoading(true);
    setError("");
    try {
      const { username, password } = authData;
      
      const response = await ApiService.login({ 
        username: username.trim(), 
        password 
      });
      
      const { wrapped_private_key, pbkdf2_salt, public_key } = response.user;
      const wrappingKey = await CryptoService.deriveWrappingKey(password, pbkdf2_salt);
      const [priv, pub] = await Promise.all([
        CryptoService.unwrapPrivateKey(wrapped_private_key, wrappingKey),
        CryptoService.importPublicKey(public_key),
      ]);

      await initSession(response, priv, pub);
    } catch (err: any) {
      console.error("[AuthContext] Login error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      if (accessToken && refreshToken) {
        await ApiService.logout(accessToken, refreshToken);
      }
    } catch (err) {
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setPrivateKey(null);
      setPublicKey(null);
      setPhase("auth");
      localStorage.clear();
      await clearKeys();
    }
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider value={{
      user, accessToken, phase, loading, initialized, error,
      privateKey, publicKey,
      register: handleRegister,
      login: handleLogin,
      logout: handleLogout,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
