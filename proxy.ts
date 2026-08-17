import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "smart-retail-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso a la página de login sin sesión
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Verificar si existe la cookie de sesión
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validación del token (formato base64, no expirado)
  try {
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verificar expiración (24 horas)
    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (now - timestamp > twentyFourHours) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluir archivos estáticos, imágenes y favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
