import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
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

        // Fetch the code record
        const { data, error } = await supabaseAdmin
            .from('extension_pair_codes')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) {
            // Return 404 to avoid leaking valid codes if possible, or just generic error
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
        }

        // Check expiration
        if (new Date(data.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Code expired' }, { status: 400 });
        }

        // Check consumed
        if (data.consumed) {
            return NextResponse.json({ error: 'Code already used' }, { status: 400 });
        }

        // Consume the code
        const { error: updateError } = await supabaseAdmin
            .from('extension_pair_codes')
            .update({ consumed: true })
            .eq('id', data.id);

        if (updateError) {
            console.error('Error marking code as consumed:', updateError);
            return NextResponse.json({ error: 'Failed to consume code' }, { status: 500 });
        }

        // Return the refresh token
        return NextResponse.json({
            refresh_token: data.refresh_token,
            user_id: data.user_id
        });

    } catch (err: any) {
        console.error('Exchange error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
