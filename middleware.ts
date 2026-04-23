import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'
import { createServerClient } from '@supabase/ssr'

const intlMiddleware = createMiddleware(routing)

const protectedRoutes = ['/add-listing', '/my-listings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Strip locale prefix to check protected routes
  const pathnameWithoutLocale = pathname.replace(/^\/(ar|he)/, '') || '/'
  const isProtected = protectedRoutes.some(r => pathnameWithoutLocale.startsWith(r))

  if (isProtected) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const locale = pathname.match(/^\/(ar|he)/)?.[1] ?? 'ar'
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    return response
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
