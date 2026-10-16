"use server";

import { redirect } from "next/navigation";
import { authenticateDashboardUser } from "@/lib/auth/credentials";
import {
  createSession,
  deleteSession,
  getAuthConfigurationError,
} from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const configurationError = getAuthConfigurationError();

  if (configurationError) {
    return { error: configurationError };
  }

  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > 100 ||
    password.length > 200
  ) {
    return { error: "Usuário ou senha inválidos." };
  }

  const matchedUsername = authenticateDashboardUser(username.trim(), password);

  if (!matchedUsername) {
    return { error: "Usuário ou senha inválidos." };
  }

  await createSession(matchedUsername);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
