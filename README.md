# OTP Worker

A lightweight OTP (TOTP) API built with Cloudflare Workers. Returns verification codes as JSON.

## API Reference

### GET /

Returns the current OTP code.

**Response:**

```json
{
	"code": "123456",
	"expires_in": 25,
	"period": 30
}
```

| Field        | Type   | Description              |
| ------------ | ------ | ------------------------ |
| `code`       | string | Current TOTP code        |
| `expires_in` | number | Seconds until expiration |
| `period`     | number | TOTP period in seconds   |

**Error Response (500):**

```json
{
	"error": "Error message"
}
```

## Setup

```bash
# Set secret
npx wrangler secret put STRINGBASE
```

```json
// edit wrangler.toml
"vars": {
  "ALGORITHM": "SHA1",
  "DIGITS": "6",
  "PERIOD": "30"
}
```

```bash
# Deploy
npm run deploy
```

## ⚠️ Security & Disclaimer

### Security Warning

- **Confidentiality**: The `STRINGBASE` secret is the master key to your OTPs. Never commit it to version control or share it.
- **Worker Exposure**: By default, this worker serves your OTP code at its assigned URL. Ensure the URL is kept private or protected by [Cloudflare Access](https://www.cloudflare.com/products/zero-trust/access/).
- **Access Control**: Since the API returns OTP codes directly, restricting access via Cloudflare Access is strongly recommended for production deployments.

### Disclaimer

This software is provided "as is", without warranty of any kind, express or implied. Use at your own risk. The authors and contributors are not responsible for any security breaches or data loss resulting from the use of this worker.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fcarolyn-sun%2Fotp-worker)
