import * as OTPAuth from 'otpauth';

export interface Env {
	STRINGBASE: string;
	ISSUER: string;
	LABEL: string;
	ALGORITHM: 'SHA1' | 'SHA256' | 'SHA512';
	DIGITS: string;
	PERIOD: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const {
			STRINGBASE,
			ISSUER = 'OTP Worker',
			LABEL = 'user@example.com',
			ALGORITHM = 'SHA1',
			DIGITS = '6',
			PERIOD = '30',
		} = env;

		if (!STRINGBASE) {
			return new Response(renderError('STRINGBASE secret is missing. Please set it using `wrangler secret put STRINGBASE`.'), {
				headers: { 'Content-Type': 'text/html' },
			});
		}

		try {
			const totp = new OTPAuth.TOTP({
				issuer: ISSUER,
				label: LABEL,
				algorithm: ALGORITHM,
				digits: parseInt(DIGITS),
				period: parseInt(PERIOD),
				secret: STRINGBASE.replace(/\s/g, '').toUpperCase(), // Basic cleanup for common secret formats
			});

			const token = totp.generate();
			const seconds = totp.period - (Math.floor(Date.now() / 1000) % totp.period);

			return new Response(renderOTP(token, seconds, totp), {
				headers: { 'Content-Type': 'text/html' },
			});
		} catch (error) {
			return new Response(renderError(`Error generating OTP: ${error instanceof Error ? error.message : String(error)}`), {
				headers: { 'Content-Type': 'text/html' },
			});
		}
	},
};

function renderOTP(token: string, seconds: number, totp: OTPAuth.TOTP) {
	const progress = (seconds / totp.period) * 100;

	// Create columns of digits for a nice display
	const digits = token.split('');
	const display = digits.map(d => `<span class="digit">${d}</span>`).join('');

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${totp.issuer} - OTP</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            --accent: #38bdf8;
            --accent-glow: rgba(56, 189, 248, 0.4);
            --glass: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Outfit', sans-serif;
            background: var(--bg-gradient);
            color: #f8fafc;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .container {
            position: relative;
            width: 100%;
            max-width: 450px;
            padding: 2rem;
            animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .card {
            background: var(--glass);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 3rem 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent);
            box-shadow: 0 0 15px var(--accent-glow);
        }

        .issuer {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
            margin-bottom: 0.5rem;
        }

        .label {
            font-size: 1.25rem;
            color: #94a3b8;
            margin-bottom: 2.5rem;
        }

        .otp-display {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 2.5rem;
            font-family: 'JetBrains Mono', monospace;
        }

        .digit {
            font-size: 3.5rem;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            width: 3.5rem;
            height: 5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .digit:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
            background: rgba(56, 189, 248, 0.05);
        }

        .timer-container {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            margin-bottom: 1rem;
            overflow: hidden;
            position: relative;
        }

        .timer-bar {
            height: 100%;
            background: var(--accent);
            width: ${progress}%;
            transition: width 1s linear;
            box-shadow: 0 0 10px var(--accent-glow);
        }

        .timer-text {
            font-size: 0.875rem;
            color: #64748b;
            font-weight: 500;
        }

        .footer {
            margin-top: 2rem;
            text-align: center;
            font-size: 0.75rem;
            color: #475569;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .footer a {
            color: #64748b;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .footer a:hover {
            color: var(--accent);
        }

        .security-warning {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 500;
            border: 1px solid rgba(239, 68, 68, 0.2);
            font-size: 0.7rem;
        }

        .btn-copy {
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.2s ease;
            margin-top: 1rem;
        }

        .btn-copy:hover {
            background: var(--accent);
            color: #0f172a;
        }

        @media (max-width: 480px) {
            .digit {
                font-size: 2.5rem;
                width: 2.5rem;
                height: 4rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="issuer">${totp.issuer}</div>
            <div class="label">${totp.label}</div>

            <div class="otp-display" id="otp-code">
                ${display}
            </div>

            <div class="timer-container">
                <div class="timer-bar" id="timer-bar"></div>
            </div>
            <div class="timer-text" id="timer-text">Expires in ${seconds}s</div>

            <button class="btn-copy" onclick="copyCode()">Copy Code</button>
        </div>
        <div class="footer">
            <div class="security-warning">
                ⚠️ SECURITY WARNING: Do not share this code or page with anyone.
                Exposing this URL may compromise your account security.<br>
                For public deployments, even if risk is low without account labels,
                restricted access via Cloudflare Access is strongly recommended.
            </div>
            <div>
                OTP Worker &bull; Secure Authentication &bull;
                <a href="https://github.com/carolyn-sun/otp-worker" target="_blank" rel="noopener noreferrer">carolyn-sun/otp-worker</a>
            </div>
        </div>
    </div>

    <script>
        let timeLeft = ${seconds};
        const period = ${totp.period};
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');

        function updateTimer() {
            if (timeLeft <= 0) {
                window.location.reload();
                return;
            }
            timeLeft--;
            const progress = (timeLeft / period) * 100;
            timerBar.style.width = progress + '%';
            timerText.innerText = 'Expires in ' + timeLeft + 's';
        }

        setInterval(updateTimer, 1000);

        function copyCode() {
            const code = '${token}';
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.querySelector('.btn-copy');
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                btn.style.borderColor = '#10b981';
                btn.style.color = '#10b981';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.borderColor = 'var(--accent)';
                    btn.style.color = 'var(--accent)';
                }, 2000);
            });
        }
    </script>
</body>
</html>
	`;
}

function renderError(message: string) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuration Error</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
        .card { background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2); max-width: 400px; text-align: center; }
        h1 { color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem; }
        p { color: #94a3b8; line-height: 1.5; }
        code { background: #1e293b; padding: 0.2rem 0.4rem; border-radius: 4px; color: #e2e8f0; font-family: monospace; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Configuration Error</h1>
        <p>${message}</p>
    </div>
</body>
</html>
	`;
}
