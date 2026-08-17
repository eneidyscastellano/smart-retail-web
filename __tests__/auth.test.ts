import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers porque no existe fuera del runtime de Next.js
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Import después del mock
const { verifyCredentials } = await import("@/lib/auth");

describe("verifyCredentials", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_USER", "admin");
    vi.stubEnv("AUTH_PASSWORD", "admin123");
  });

  it("retorna true con credenciales correctas", () => {
    expect(verifyCredentials("admin", "admin123")).toBe(true);
  });

  it("retorna false con usuario incorrecto", () => {
    expect(verifyCredentials("wrong", "admin123")).toBe(false);
  });

  it("retorna false con contraseña incorrecta", () => {
    expect(verifyCredentials("admin", "wrong")).toBe(false);
  });

  it("retorna false con ambos incorrectos", () => {
    expect(verifyCredentials("hacker", "password")).toBe(false);
  });

  it("retorna false con strings vacíos", () => {
    expect(verifyCredentials("", "")).toBe(false);
  });

  it("es case-sensitive en usuario", () => {
    expect(verifyCredentials("Admin", "admin123")).toBe(false);
  });

  it("es case-sensitive en contraseña", () => {
    expect(verifyCredentials("admin", "Admin123")).toBe(false);
  });
});
