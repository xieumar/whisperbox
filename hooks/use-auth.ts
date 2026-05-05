"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "@/lib/types";
import { CryptoService, base64Encode } from "@/lib/crypto";
import { ApiService } from "@/lib/api";

export type AuthPhase = "auth" | "app";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<AuthPhase>("auth");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState("");

  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyRef = useRef<CryptoKey | null>(null);

  const initSession = useCallback(async (data: any, privateKey: CryptoKey, publicKey: CryptoKey) => {
    privateKeyRef.current = privateKey;
    publicKeyRef.current = publicKey;
    
    setUser(data.user);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setPhase("app");

    // Persist session
    localStorage.setItem("wb_user", JSON.stringify(data.user));
    localStorage.setItem("wb_at", data.access_token);
    localStorage.setItem("wb_rt", data.refresh_token);
    localStorage.setItem("wb_wpk", data.user.wrapped_private_key);
    localStorage.setItem("wb_pk", data.user.public_key);
    localStorage.setItem("wb_salt", data.user.pbkdf2_salt);
  }, []);

  // Restore session
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
          setPhase("app");
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      } finally {
        setInitialized(true);
      }
    };
    restoreSession();
  }, []);

  const register = async (authData: any) => {
    setLoading(true);
    setError("");
    try {
      const username = (authData.username || "").trim();
      const displayName = (authData.display_name || "").trim();
      const password = authData.password || "";

      const keyPair = await CryptoService.generateKeyPair();
      const salt = CryptoService.generateSalt();
      const wrappingKey = await CryptoService.deriveWrappingKey(password, salt.buffer as ArrayBuffer);
      
      const [wrappedPK, publicB64] = await Promise.all([
        CryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey),
        CryptoService.exportPublicKey(keyPair.publicKey),
      ]);

      const response = await ApiService.register({
        username,
        display_name: displayName,
        password,
        public_key: publicB64,
        wrapped_private_key: wrappedPK,
        pbkdf2_salt: base64Encode(salt.buffer as ArrayBuffer),
      });

      await initSession(response, keyPair.privateKey, keyPair.publicKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authData: any) => {
    setLoading(true);
    setError("");
    try {
      const username = (authData.username || "").trim();
      const password = authData.password || "";

      const response = await ApiService.login({ username, password });
      const { wrapped_private_key, pbkdf2_salt, public_key } = response.user;

      const wrappingKey = await CryptoService.deriveWrappingKey(password, pbkdf2_salt);
      const [privateKey, publicKey] = await Promise.all([
        CryptoService.unwrapPrivateKey(wrapped_private_key, wrappingKey),
        CryptoService.importPublicKey(public_key),
      ]);

      await initSession(response, privateKey, publicKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (accessToken && refreshToken) {
        await ApiService.logout(accessToken, refreshToken);
      }
    } catch (err) {
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      privateKeyRef.current = null;
      publicKeyRef.current = null;
      setPhase("auth");
      localStorage.clear();
    }
  }, [accessToken, refreshToken]);

  return {
    user,
    accessToken,
    phase,
    loading,
    initialized,
    error,
    privateKey: privateKeyRef.current,
    publicKey: publicKeyRef.current,
    register,
    login,
    logout,
    setError,
  };
}
