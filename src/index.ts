import * as OTPAuth from 'otpauth';

export interface Env {
	STRINGBASE: string;
	ALGORITHM: 'SHA1' | 'SHA256' | 'SHA512';
	DIGITS: string;
	PERIOD: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const {
			STRINGBASE,
			ALGORITHM = 'SHA1',
			DIGITS = '6',
			PERIOD = '30',
		} = env;

		const headers = {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
		};

		if (!STRINGBASE) {
			return new Response(JSON.stringify({ error: 'STRINGBASE secret is not configured' }), {
				status: 500,
				headers,
			});
		}

		try {
			const totp = new OTPAuth.TOTP({
				algorithm: ALGORITHM,
				digits: parseInt(DIGITS),
				period: parseInt(PERIOD),
				secret: STRINGBASE.replace(/\s/g, '').toUpperCase(),
			});

			const token = totp.generate();
			const seconds = totp.period - (Math.floor(Date.now() / 1000) % totp.period);

			return new Response(JSON.stringify({ code: token, expires_in: seconds, period: totp.period }), {
				headers,
			});
		} catch (error) {
			return new Response(JSON.stringify({ error: `Error generating OTP: ${error instanceof Error ? error.message : String(error)}` }), {
				status: 500,
				headers,
			});
		}
	},
};
