# OTP Worker

A beautiful, configurable OTP (TOTP) authenticator built with Cloudflare Workers.

## Features

- **Secure**: Sensitive OTP secrets are stored in Cloudflare Secrets.
- **Configurable**: Metadata like Issuer and Label are stored in Environment Variables.
- **Responsive & Premium UI**: A sleek, animated, and dark-themed UI for displaying your OTP code.
- **Micro-animations**: Progress bars and copy-to-clipboard feedback.

## Setup

### 1. Set your Secret

The OTP secret (Base32 format) MUST be stored as a Cloudflare Secret named `STRINGBASE`.

```bash
npx wrangler secret put STRINGBASE
```

### 2. Configure Environment Variables

Edit `wrangler.jsonc` to set your desired metadata:

```json
"vars": {
  "ISSUER": "Demo",
  "LABEL": "[EMAIL_ADDRESS]",
  "ALGORITHM": "SHA1",
  "DIGITS": "6",
  "PERIOD": "30"
}
```

### 3. Deploy

```bash
npm run deploy
```

## Local Development

1. Create a `.dev.vars` file (already initialized with a dummy secret).
2. Run `npm run dev`.
3. Open `http://localhost:8787` in your browser.

## Tech Stack

- **Cloudflare Workers**: High-performance edge computing.
- **otpauth**: Modern OTP generation library.
- **Vanilla CSS**: Premium dark-themed UI with glassmorphism.
- **TypeScript**: Type-safe development.

## ⚠️ Security & Disclaimer

### Security Warning

- **Confidentiality**: The `STRINGBASE` secret is the master key to your OTPs. Never commit it to version control or share it.
- **Worker Exposure**: By default, this worker serves your OTP code at its assigned URL. Ensure the URL is kept private or protected by [Cloudflare Access](https://www.cloudflare.com/products/zero-trust/access/) if you require authentication to view the code.
- **Public Domain Deployment**: If deployed on a public domain, while the security risk is minimal if account descriptors or unique identifiers are not exposed, sharing this page is still not recommended. Using Cloudflare Access to restrict access is highly encouraged.
- **Browser History**: Viewing this page may store the OTP code or the page in your browser's cache/history. Use Incognito/Private mode if on a shared device.

### Disclaimer

This software is provided "as is", without warranty of any kind, express or implied. Use at your own risk. The authors and contributors are not responsible for any security breaches or data loss resulting from the use of this worker.
