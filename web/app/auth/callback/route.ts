import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const requestUrl = request.nextUrl
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/meetings'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const isRelative = next.startsWith('/') && !next.startsWith('//') && !next.includes('://');
            const targetUrl = requestUrl.clone()
            targetUrl.pathname = isRelative ? next : '/meetings'
            targetUrl.searchParams.delete('code')
            targetUrl.searchParams.delete('next')

            return NextResponse.redirect(targetUrl)
        }
    }

    // return the user to an error page with instructions
    const errorUrl = requestUrl.clone()
    errorUrl.pathname = '/auth/auth-code-error'
    errorUrl.searchParams.delete('code')
    errorUrl.searchParams.delete('next')
    return NextResponse.redirect(errorUrl)
}
