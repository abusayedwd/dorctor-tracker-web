import { API_BASE } from "./constants";
import type { ApiResponse, Session } from "@/types";

let inflight: Promise<Session | null> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 *
 * Refresh tokens are single-use (rotated server-side), so concurrent callers
 * — several 401s at once, React StrictMode double effects, the auth guard and
 * the base query racing — MUST share one request. Otherwise the second call
 * would present an already-rotated token and sign the user out.
 */
export const refreshSession = (): Promise<Session | null> => {
  inflight ??= fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (res) => (res.ok ? ((await res.json()) as ApiResponse<Session>).data : null))
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
};
