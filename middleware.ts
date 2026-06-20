import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = "offerfu.com";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostWithoutPort = host.split(":")[0];

  if (!hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const subdomain = hostWithoutPort
    .slice(0, -(`.${ROOT_DOMAIN}`).length)
    .toLowerCase();

  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return NextResponse.next();
  }

  if (subdomain.includes(".")) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  const res =
    url.pathname === "/" || url.pathname === ""
      ? (() => {
          url.pathname = `/niche/${subdomain}`;
          return NextResponse.rewrite(url);
        })()
      : NextResponse.next();

  res.cookies.set("offerfu_niche", subdomain, {
    domain: `.${ROOT_DOMAIN}`,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|images/|.*\\.).*)"],
};