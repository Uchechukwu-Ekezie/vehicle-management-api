export function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((c) => c.trim().startsWith("token="));

  if (!tokenCookie) return null;

  return tokenCookie.split("=")[1];
}

export function setTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}

export function removeTokenCookie() {
  document.cookie = "token=; path=/; max-age=0";
}

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    // Simple base64 decode of JWT payload
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function getUserFromToken(token: string) {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.sub || decoded.userId || decoded.id,
    username: decoded.unique_name || decoded.username,
    email: decoded.email,
    role:
      decoded.role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  };
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const exp = decoded.exp as number;
  return exp * 1000 < Date.now();
}
