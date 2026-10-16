import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDashboardUsers } from "@/lib/auth/credentials";

export const SESSION_COOKIE = "copart_dashboard_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const SESSION_ISSUER = "copart-dashboard";
const SESSION_AUDIENCE = "copart-dashboard";

export type DashboardSession = {
  username: string;
};

function getSessionKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export function getAuthConfigurationError() {
  if (getDashboardUsers().length === 0) {
    return "Configure DASHBOARD_USERS no ambiente.";
  }

  if (!getSessionKey()) {
    return "Configure AUTH_SECRET com pelo menos 32 caracteres.";
  }

  return null;
}

export async function createSession(username: string) {
  const key = getSessionKey();

  if (!key) {
    throw new Error("AUTH_SECRET ausente ou muito curto.");
  }

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(key);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<DashboardSession | null> {
  const key = getSessionKey();

  if (!key || !token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });

    if (typeof payload.username !== "string" || payload.sub !== payload.username) {
      return null;
    }

    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
