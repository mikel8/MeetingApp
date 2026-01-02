import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number, resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
    try {
        // 1. Rate Limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

        const now = Date.now();
        const userLimit = rateLimit.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

        if (now > userLimit.resetAt) {
            userLimit.count = 0;
            userLimit.resetAt = now + RATE_LIMIT_WINDOW;
        }

        if (userLimit.count >= MAX_ATTEMPTS) {
            console.warn(`Rate limit exceeded for IP: ${ip}`);
            return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
        }

        userLimit.count++;
        rateLimit.set(ip, userLimit);

        // 2. Format Validation
        const { code } = await request.json();

        // Strict validation: Must be exactly 6 digits
        if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
            console.warn(`Invalid code format received from IP: ${ip}`);
            // Return generic error to avoid probing
            return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );

        // 3. Atomic Consume & Check
        // We attempt to update the row ONLY if it is valid, unconsumed, and not expired.
        // If no row is returned, it means the code was invalid, consumed, or expired.
        // This prevents race conditions.
        const { data, error } = await supabaseAdmin
            .from('extension_pair_codes')
            .update({ consumed: true })
            .eq('code', code)
            .eq('consumed', false)
            .gt('expires_at', new Date().toISOString())
            .select('refresh_token, user_id')
            .single();

        if (error || !data) {
            // 4. Log failed attempts
            console.warn(`Failed exchange attempt for code (redacted) from IP: ${ip}. Error: ${error?.message || 'No matching valid code found'}`);
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
        }

        // Success
        console.info(`Successfully exchanged code for user ${data.user_id}`);
        return NextResponse.json({
            refresh_token: data.refresh_token,
            user_id: data.user_id
        });

    } catch (err) {
        console.error('Exchange error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
