# VAULT

VAULT is a high-security, end-to-end encrypted (E2EE) messaging environment designed for zero-knowledge communication. The platform utilizes the Web Crypto API for client-side encryption, ensuring that private keys and plaintext data never leave the user's local environment.

## Architecture

The application follows a strictly modular architecture centered around a secure "Vault" dashboard.

- **Client-Side Encryption**: AES-256-GCM for message payloads and ECDH P-256 for secure key exchange.
- **Zero-Knowledge Persistence**: Messages are encrypted locally before being transmitted to the Koyeb-hosted backend via WebSocket or REST fallback.
- **Volatile Identity**: Private keys are held in memory only, necessitating re-authentication for session restoration to prevent unauthorized access from persisted local storage.

## Core Features

- **Encrypted Messaging**: Real-time communication with cryptographic status indicators.
- **Security Dashboard**: Live monitoring of encryption protocols, ephemeral key rotations, and protocol audit logs.
- **Identity Profile**: Management of unique identity hashes and cryptographic fingerprints.
- **Responsive Operative UI**: A monochromatic, technical interface optimized for high-performance and focus.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Communication**: WebSocket (Primary), REST API (Fallback)
- **Security**: Web Crypto API
- **Icons**: Lucide React

## Development

### Prerequisites

- Node.js 18.x or higher
- pnpm / npm / yarn

### Installation

```bash
git clone https://github.com/xieumar/Vault.git
cd vault
pnpm install
```

### Environment Configuration

Ensure your environment variables are configured for the Koyeb backend:

```env
NEXT_PUBLIC_API_URL=https://whisperbox.koyeb.app
```

### Execution

```bash
pnpm run dev
```

The application will be accessible at `http://localhost:3000`.

## Security Disclaimer

VAULT is an operative tool designed for secure communication. Ensure your Master Passphrase is kept secure; lost passphrases result in total loss of identity and message history as data is strictly zero-knowledge.
