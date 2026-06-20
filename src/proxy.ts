import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "offerfu.com";

const isPublicRoute = createRouteMatcher([
  "/",
  "/niche/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/terms(.*)",
  "/api/chat",
  "/api/sessions",
  "/api/sessions/(.*)",
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  const host = request.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];

  if (hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostWithoutPort
      .slice(0, -(`.${ROOT_DOMAIN}`).length)
      .toLowerCase();

    if (subdomain && subdomain !== "www" && subdomain !== "app" && !subdomain.includes(".")) {
      const url = request.nextUrl.clone();
      if (url.pathname === "/" || url.pathname === "") {
        url.pathname = `/niche/${subdomain}`;
        const res = NextResponse.rewrite(url);
        res.cookies.set("offerfu_niche", subdomain, {
          domain: `.${ROOT_DOMAIN}`,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        });
        return res;
      }
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};