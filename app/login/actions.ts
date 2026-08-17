"use server";

import { redirect } from "next/navigation";
import { verifyCredentials, createSession } from "@/lib/auth";

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Usuario y contraseña son obligatorios." };
  }

  const isValid = verifyCredentials(username, password);
  if (!isValid) {
    return { success: false, error: "Usuario o contraseña incorrectos." };
  }

  await createSession(username);
  redirect("/");
}
