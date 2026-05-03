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
  const [error, setError] = useState("");

  // Refs for cryptographic keys (E2EE)
  const privateKeyRef = useRef<CryptoKey | null>(null);
  const publicKeyRef = useRef<CryptoKey | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("wb_user");
    const savedToken = localStorage.getItem("wb_at");
    const savedRT = localStorage.getItem("wb_rt");
    const savedWrappedPK = localStorage.getItem("wb_wpk");
    const savedPubK = localStorage.getItem("wb_pk");

    if (savedUser && savedToken && savedRT) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
      setRefreshToken(savedRT);
      setPhase("app");
      // Note: keys need to be unwrapped with password, 
      // so we can't fully restore keys without user input.
      // But we can store the wrapped keys for later unwrapping.
    }
  }, []);

  // Persistence
  useEffect(() => {
    if (user && accessToken && refreshToken) {
      localStorage.setItem("wb_user", JSON.stringify(user));
      localStorage.setItem("wb_at", accessToken);
      localStorage.setItem("wb_rt", refreshToken);
    } else {
      localStorage.removeItem("wb_user");
      localStorage.removeItem("wb_at");
      localStorage.removeItem("wb_rt");
      localStorage.removeItem("wb_wpk");
      localStorage.removeItem("wb_pk");
    }
  }, [user, accessToken, refreshToken]);

  // Token Refresh Loop
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(async () => {
      try {
        const data = await ApiService.refresh(refreshToken);
        setAccessToken(data.access_token);
      } catch (err) {
        logout();
      }
    }, 14 * 60 * 1000); // 14 minutes
    return () => clearInterval(interval);
  }, [refreshToken]);

  const initSession = useCallback(async (data: any, privateKey: CryptoKey, publicKey: CryptoKey) => {
    privateKeyRef.current = privateKey;
    publicKeyRef.current = publicKey;
    
    setUser(data.user);
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setPhase("app");
  }, []);

  const register = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const username = (formData.get("username")?.toString() || "").trim();
      const displayName = (formData.get("display_name")?.toString() || "").trim();
      const password = (formData.get("password")?.toString() || "");

      const usernameRegex = /^[a-zA-Z0-9_-]+$/;

      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters long");
      }
      if (!usernameRegex.test(username)) {
        throw new Error(`Username "${username}" may only contain letters, digits, _ and -`);
      }
      if (!displayName || displayName.length < 1) {
        throw new Error("Display Name is required");
      }
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // 1. Generate E2EE Keys
      const keyPair = await CryptoService.generateKeyPair();
      const salt = CryptoService.generateSalt();
      
      // 2. Derive Wrapping Key
      const wrappingKey = await CryptoService.deriveWrappingKey(password, salt.buffer as ArrayBuffer);
      
      // 3. Wrap Keys for Storage
      const [wrappedPK, publicB64] = await Promise.all([
        CryptoService.wrapPrivateKey(keyPair.privateKey, wrappingKey),
        CryptoService.exportPublicKey(keyPair.publicKey),
      ]);

      // 4. Register with Backend
      const data = await ApiService.register({
        username,
        display_name: displayName,
        password,
        public_key: publicB64,
        wrapped_private_key: wrappedPK,
        pbkdf2_salt: base64Encode(salt.buffer as ArrayBuffer),
      });

      await initSession(data, keyPair.privateKey, keyPair.publicKey);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData: FormData) => {
    setLoading(true);
    setError("");
    try {
      const username = (formData.get("username") as string || "").trim();
      const password = formData.get("password") as string;

      // 1. Authenticate with Backend
      const data = await ApiService.login({ username, password });
      
      const { wrapped_private_key, pbkdf2_salt, public_key } = data.user;

      // 2. Derive Wrapping Key to unwrap the private key
      const wrappingKey = await CryptoService.deriveWrappingKey(password, pbkdf2_salt);
      
      // 3. Unwrap Keys
      const [privateKey, publicKey] = await Promise.all([
        CryptoService.unwrapPrivateKey(wrapped_private_key, wrappingKey),
        CryptoService.importPublicKey(public_key),
      ]);

      await initSession(data, privateKey, publicKey);
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
      // Ignore logout errors
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
    error,
    privateKey: privateKeyRef.current,
    publicKey: publicKeyRef.current,
    register,
    login,
    logout,
    setError,
  };
}
