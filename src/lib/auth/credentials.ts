import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export type DashboardCredential = {
  username: string;
  password: string;
};

function constantTimeEqual(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

function isCredential(value: unknown): value is DashboardCredential {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const username = "username" in value ? value.username : null;
  const password = "password" in value ? value.password : null;

  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username.length > 0 &&
    username.length <= 100 &&
    password.length > 0 &&
    password.length <= 200
  );
}

export function parseDashboardUsers(raw: string | undefined): DashboardCredential[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCredential);
  } catch {
    return [];
  }
}

export function getDashboardUsers(): DashboardCredential[] {
  const users = parseDashboardUsers(process.env.DASHBOARD_USERS);

  if (users.length > 0) {
    return users;
  }

  const username = process.env.DASHBOARD_USERNAME;
  const password = process.env.DASHBOARD_PASSWORD;

  if (username && password) {
    return [{ username, password }];
  }

  return [];
}

export function authenticateDashboardUser(
  username: string,
  password: string,
): string | null {
  let matchedUsername: string | null = null;

  for (const user of getDashboardUsers()) {
    const usernameMatches = constantTimeEqual(username, user.username);
    const passwordMatches = constantTimeEqual(password, user.password);

    if (usernameMatches && passwordMatches) {
      matchedUsername = user.username;
    }
  }

  return matchedUsername;
}
