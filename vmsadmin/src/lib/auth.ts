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
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    let decoded: string;
    if (typeof Buffer !== "undefined") {
      decoded = Buffer.from(payload, "base64").toString();
    } else if (typeof atob !== "undefined") {
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      decoded = atob(padded);
    } else {
      return null;
    }
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
    id: decoded.sub || 
        decoded.nameid || 
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.userId || 
        decoded.id,
    username: decoded.name ||
              decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
              decoded.unique_name || 
              decoded.username,
    email: decoded.email ||
           decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"],
    role: decoded.role ||
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  };
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const exp = decoded.exp as number;
  return exp * 1000 < Date.now();
}
