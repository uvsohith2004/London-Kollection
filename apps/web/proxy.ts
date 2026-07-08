import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const locales = ['en', 'ar'];
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
});

// Classify routes (paths without locale prefix)
const guestRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];
const authFlowRoutes = ["/verify-otp", "/verify-email"];
const adminRoutes = ["/admin"];
const protectedRoutes = ["/account", "/checkout"];

function isRouteMatch(path: string, routes: string[]) {
  return routes.some(route => path === route || path.startsWith(`${route}/`));
}

export async function proxy(req: NextRequest) {
  // Skip Next.js internal requests, API, and static files
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Determine the path without the locale prefix
  const pathname = req.nextUrl.pathname;
  let pathWithoutLocale = pathname;
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
      break;
    }
  }

  // 1. Fetch Session from our backend via the Next.js API proxy
  let session = null;
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const res = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store"
    });
    if (res.ok) {
      session = await res.json();
    }
  } catch (e) {
    // Suppress fetch errors (e.g. backend down)
  }

  const user = session?.user;

  // 2. Auth Flow Guard
  // Only accessible if the user has an active flow state cookie
  if (isRouteMatch(pathWithoutLocale, authFlowRoutes)) {
    const flowState = req.cookies.get("lk_flow_state");
    if (!flowState) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 3. Guest Guard
  // Redirect authenticated users away from sign-in/up pages
  if (isRouteMatch(pathWithoutLocale, guestRoutes)) {
    if (user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = user.role === "admin" ? "/admin" : "/account";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 4. Admin Guard
  // Protect /admin routes to only allow admin roles
  if (isRouteMatch(pathWithoutLocale, adminRoutes)) {
    if (!user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      return NextResponse.redirect(redirectUrl);
    }
    if (user.role !== "admin") {
      // Create a rewrite to a 403 Unauthorized page instead of redirecting
      // Or just redirect to account for simplicity
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/account"; 
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 5. Protected Customer Routes
  if (isRouteMatch(pathWithoutLocale, protectedRoutes)) {
    if (!user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Proceed with standard Next-Intl routing
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
