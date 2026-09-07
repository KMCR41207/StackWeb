import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHmac } from "node:crypto";

const SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours

function sign(payload: string): string {
  const secret = process.env["ADMIN_SESSION_SECRET"] ?? "dev-secret-change-me";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function makeToken(username: string): string {
  const expires = Date.now() + SESSION_MS;
  const payload = `${username}:${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (sign(payload) !== sig) return null;
  const parts = payload.split(":");
  const username = parts[0];
  const expiresStr = parts[1];
  if (!username || !expiresStr) return null;
  if (Date.now() > Number(expiresStr)) return null;
  return username;
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input) =>
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const validUser = process.env["ADMIN_USERNAME"] ?? "stackweb_admin";
    const validPass = process.env["ADMIN_PASSWORD"] ?? "Sw@2026#Secure";

    if (data.username !== validUser || data.password !== validPass) {
      throw new Error("Invalid credentials.");
    }

    // Return a signed token — client stores it in sessionStorage
    return { token: makeToken(data.username) };
  });

export const validateAdminToken = createServerFn({ method: "POST" })
  .validator((input) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    // Also check Authorization header as fallback
    const req = getRequest();
    const headerToken = req.headers.get("x-admin-token") ?? "";
    const tokenToCheck = data.token || headerToken;
    const username = verifyToken(tokenToCheck);
    return { authenticated: !!username, username };
  });
