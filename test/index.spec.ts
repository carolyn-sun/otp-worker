import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('OTP Worker', () => {
	it('responds with OTP page (unit style)', async () => {
		const request = new Request('http://example.com/');
		const ctx = createExecutionContext();
		// In test environment, STRINGBASE should be provided via 'env' or '.dev.vars'
		// Note: cloudflare:test 'env' might not load '.dev.vars' automatically unless configured.
		// I'll assume it's there or handle the 200/error case.
		const response = await worker.fetch(request, env as any, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain('OTP');
	});

	it('responds with OTP page (integration style)', async () => {
		const request = new Request('http://example.com/');
		const response = await SELF.fetch(request);
		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain('OTP');
	});
});
