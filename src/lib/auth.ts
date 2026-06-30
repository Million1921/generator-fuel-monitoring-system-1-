import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defineAbilitiesFor, Actions, Subjects } from "./ability";

export type AppRole = "ADMIN" | "TECHNICIAN" | "MANAGER" | "SUPERVISOR" | "FINANCE";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function getRoleFromClerk(): Promise<AppRole> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new AuthError("Unauthorized", 401);
  }

  const claims = sessionClaims as Record<string, any> | null;
  const role =
    claims?.metadata?.role ??
    claims?.publicMetadata?.role ??
    claims?.role ??
    (await currentUser())?.publicMetadata?.role;

  return typeof role === "string" ? (role as AppRole) : "TECHNICIAN";
}

export async function requireRole(allowedRoles: AppRole[]) {
  const role = await getRoleFromClerk();

  if (!allowedRoles.includes(role)) {
    throw new AuthError("Forbidden", 403);
  }

  return role;
}

export async function requireAbility(action: Actions, subject: Subjects) {
  const role = await getRoleFromClerk();
  const ability = defineAbilitiesFor(role);

  if (!ability.can(action, subject)) {
    throw new AuthError("Forbidden", 403);
  }

  return { role, ability };
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return null;
}
