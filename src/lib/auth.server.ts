import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours

function sign(payload: string): string {
  const secret = process.env["ADMIN_SESSION_SECRET"];
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function makeToken(username: string): string {
  const expires = Date.now() + SESSION_MS;
  const payload = `${username}:${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): string | null {
  try {
    const lastDot = token.lastIndexOf(".");
    if (lastDot === -1) return null;
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);

    // Timing-safe comparison to prevent timing attacks
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(sig);
    if (expected.length !== actual.length) return null;
    if (!timingSafeEqual(expected, actual)) return null;

    const parts = payload.split(":");
    const username = parts[0];
    const expiresStr = parts[1];
    if (!username || !expiresStr) return null;
    if (Date.now() > Number(expiresStr)) return null;
    return username;
  } catch {
    return null;
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input) =>
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const validUser = process.env["ADMIN_USERNAME"];
    const validPass = process.env["ADMIN_PASSWORD"];

    if (!validUser || !validPass) {
      throw new Error("Admin credentials are not configured.");
    }

    // Timing-safe comparison to prevent username/password enumeration
    const userMatch = timingSafeEqual(
      Buffer.from(data.username.padEnd(64)),
      Buffer.from(validUser.padEnd(64))
    );
    const passMatch = timingSafeEqual(
      Buffer.from(data.password.padEnd(128)),
      Buffer.from(validPass.padEnd(128))
    );

    if (!userMatch || !passMatch) {
      throw new Error("Invalid credentials.");
    }

    return { token: makeToken(data.username) };
  });

export const validateAdminToken = createServerFn({ method: "POST" })
  .validator((input) => z.object({ token: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const req = getRequest();
    const headerToken = req.headers.get("x-admin-token") ?? "";
    const tokenToCheck = data.token || headerToken;
    const username = verifyToken(tokenToCheck);
    return { authenticated: !!username, username };
  });
