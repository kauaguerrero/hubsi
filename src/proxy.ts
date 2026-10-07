import { NextResponse, type NextRequest } from "next/server";
import { atualizarSessao } from "@/lib/supabase/proxy";

/** Protege /admin: sem sessão, vai para o login. O papel é checado em cada página/action (requireRole). */
export async function proxy(request: NextRequest) {
  const { response, user } = await atualizarSessao(request);
  const { pathname } = request.nextUrl;

  if (!user && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
