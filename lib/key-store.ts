/**
 * IndexedDB-backed store for CryptoKey objects.
 * Unlike localStorage, IndexedDB supports structured cloning of CryptoKey,
 * allowing us to persist E2EE keys across page refreshes.
 */

const DB_NAME = "whisperbox_keys";
const STORE_NAME = "keys";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeKeys(privateKey: CryptoKey, publicKey: CryptoKey): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(privateKey, "privateKey");
  store.put(publicKey, "publicKey");
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function loadKeys(): Promise<{ privateKey: CryptoKey; publicKey: CryptoKey } | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const [priv, pub] = await Promise.all([
      idbGet<CryptoKey>(store, "privateKey"),
      idbGet<CryptoKey>(store, "publicKey"),
    ]);

    db.close();
    if (priv && pub) return { privateKey: priv, publicKey: pub };
    return null;
  } catch {
    return null;
  }
}

export async function clearKeys(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); resolve(); };
    });
  } catch {
    // Silently fail — logout should never block on this
  }
}

function idbGet<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}
