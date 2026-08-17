import { cookies } from "next/headers";

const SESSION_COOKIE = "smart-retail-session";

/**
 * Genera un token de sesión simple usando HMAC-like hash.
 * En producción se usaría JWT o una librería como iron-session.
 */
function generateToken(username: string): string {
  const secret = process.env.AUTH_SECRET || "default-secret";
  const payload = `${username}:${Date.now()}:${secret}`;
  return Buffer.from(payload).toString("base64");
}

/**
 * Verifica que el token de sesión sea válido (no expirado, formato correcto).
 */
function validateToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 3) return false;

    const secret = process.env.AUTH_SECRET || "default-secret";
    // Verificar que el secret coincida
    if (!decoded.includes(secret)) return false;

    // Verificar que no haya expirado (24 horas)
    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (now - timestamp > twentyFourHours) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica credenciales contra las variables de entorno.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const validUser = process.env.AUTH_USER || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "admin123";
  return username === validUser && password === validPassword;
}

/**
 * Crea una sesión (setea cookie).
 */
export async function createSession(username: string) {
  const token = generateToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 horas
    path: "/",
  });
}

/**
 * Verifica si hay una sesión activa válida.
 */
export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return validateToken(token);
}

/**
 * Destruye la sesión (elimina cookie).
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
