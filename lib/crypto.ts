export const b64e = (buf: ArrayBuffer): string => {
    const bytes = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
};

export const b64d = (s: string): ArrayBuffer => {
    const raw = atob(s);
    const buf = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
    return buf.buffer;
};

export const CE = {
    genKP: () =>
        crypto.subtle.generateKey(
            { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
            true,
            ["encrypt", "decrypt"]
        ),

    genSalt: () => crypto.getRandomValues(new Uint8Array(16)),

    async deriveWK(password: string, salt: ArrayBuffer | string) {
        const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
        return crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: typeof salt === "string" ? b64d(salt) : salt, iterations: 100000, hash: "SHA-256" },
            km,
            { name: "AES-KW", length: 256 },
            false,
            ["wrapKey", "unwrapKey"]
        );
    },

    async wrapPK(pk: CryptoKey, wk: CryptoKey) { return b64e(await crypto.subtle.wrapKey("pkcs8", pk, wk, "AES-KW")); },

    async unwrapPK(data: string, wk: CryptoKey) {
        return crypto.subtle.unwrapKey(
            "pkcs8", b64d(data), wk,
            { name: "AES-KW" },
            { name: "RSA-OAEP", hash: "SHA-256" },
            false,
            ["decrypt"]
        );
    },

    async exportPub(k: CryptoKey) { return b64e(await crypto.subtle.exportKey("spki", k)); },
    async importPub(s: string) {
        return crypto.subtle.importKey("spki", b64d(s), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
    },

    async encrypt(text: string, rPub: CryptoKey, sPub: CryptoKey) {
        const aes = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aes, new TextEncoder().encode(text));
        const raw = await crypto.subtle.exportKey("raw", aes);
        const [ek, eks] = await Promise.all([
            crypto.subtle.encrypt({ name: "RSA-OAEP" }, rPub, raw),
            crypto.subtle.encrypt({ name: "RSA-OAEP" }, sPub, raw),
        ]);
        return {
            ciphertext: b64e(ct),
            iv: b64e(iv.buffer),
            encryptedKey: b64e(ek),
            encryptedKeyForSelf: b64e(eks)
        };
    },

    async decrypt(payload: any, priv: CryptoKey, isMine: boolean) {
        const ek = isMine ? payload.encryptedKeyForSelf : payload.encryptedKey;
        if (!ek) throw new Error("No decryption key in payload");
        const raw = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, priv, b64d(ek));
        const aes = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["decrypt"]);
        const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64d(payload.iv) }, aes, b64d(payload.ciphertext));
        return new TextDecoder().decode(pt);
    },
};