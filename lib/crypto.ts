export const base64Encode = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};

export const base64Decode = (s: string): ArrayBuffer => {
  const raw = atob(s);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
};

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}

export const CryptoService = {
  /**
   * Generates a new RSA-OAEP key pair for E2EE.
   */
  generateKeyPair: async (): Promise<CryptoKeyPair> => {
    return crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  },

  /**
   * Generates a random 16-byte salt for PBKDF2.
   */
  generateSalt: (): Uint8Array => crypto.getRandomValues(new Uint8Array(16)),

  /**
   * Derives a Wrapping Key (WK) from a password and salt.
   */
  async deriveWrappingKey(password: string, salt: ArrayBuffer | string): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: typeof salt === "string" ? base64Decode(salt) : salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  /**
   * Wraps a private key using a wrapping key.
   * Uses AES-GCM and returns "iv:ciphertext" in base64.
   */
  async wrapPrivateKey(pk: CryptoKey, wk: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const exported = await crypto.subtle.exportKey("pkcs8", pk);
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      wk,
      exported
    );
    
    return `${base64Encode(iv.buffer)}:${base64Encode(ciphertext)}`;
  },

  /**
   * Unwraps a private key using a wrapping key.
   */
  async unwrapPrivateKey(data: string, wk: CryptoKey): Promise<CryptoKey> {
    const [ivB64, ctB64] = data.split(":");
    if (!ctB64) {
      // Fallback for old AES-KW format if any exist (though unlikely here)
      throw new Error("Invalid wrapped key format");
    }

    const iv = base64Decode(ivB64);
    const ciphertext = base64Decode(ctB64);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      wk,
      ciphertext
    );
    
    return crypto.subtle.importKey(
      "pkcs8",
      decrypted,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );
  },

  /**
   * Exports a public key to SPKI base64 format.
   */
  async exportPublicKey(k: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey("spki", k);
    return base64Encode(exported);
  },

  /**
   * Imports a public key from SPKI base64 format.
   */
  async importPublicKey(s: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      "spki",
      base64Decode(s),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  },

  /**
   * Encrypts text for a recipient and oneself (for message history).
   */
  async encrypt(text: string, recipientPublicKey: CryptoKey, senderPublicKey: CryptoKey): Promise<EncryptedPayload> {
    const aesKey = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      new TextEncoder().encode(text)
    );
    
    const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
    const [encryptedKey, encryptedKeyForSelf] = await Promise.all([
      crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientPublicKey, rawAesKey),
      crypto.subtle.encrypt({ name: "RSA-OAEP" }, senderPublicKey, rawAesKey),
    ]);

    return {
      ciphertext: base64Encode(ciphertext),
      iv: base64Encode(iv.buffer),
      encryptedKey: base64Encode(encryptedKey),
      encryptedKeyForSelf: base64Encode(encryptedKeyForSelf),
    };
  },

  /**
   * Decrypts a payload using the private key.
   */
  async decrypt(payload: any, privateKey: CryptoKey, isMine: boolean): Promise<string> {
    const encryptedKey = isMine ? payload.encryptedKeyForSelf : payload.encryptedKey;
    if (!encryptedKey) throw new Error("No decryption key in payload");

    const rawAesKey = await crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      base64Decode(encryptedKey)
    );
    
    const aesKey = await crypto.subtle.importKey(
      "raw",
      rawAesKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64Decode(payload.iv) },
      aesKey,
      base64Decode(payload.ciphertext)
    );
    
    return new TextDecoder().decode(plaintext);
  },
};
