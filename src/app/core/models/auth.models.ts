
/** Payload sent to POST /api/v1/auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Payload sent to POST /api/v1/auth/register */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
}

/** Response body returned by both /login and /register */
export interface AuthResponse {
  /** Spring Boot auth-service returns this field name */
  token?: string;
  /** Optional alias if you add it on the server later */
  accessToken?: string;
  tokenType?: string;
  username: string;
  email: string;
}

/**
 * The decoded payload of a JWT.
 * Extend with additional claims your backend embeds.
 */
export interface JwtPayload {
  sub: string;         // username
  iat: number;         // issued-at (epoch seconds)
  exp: number;         // expiry (epoch seconds)
}

/** Minimal in-memory representation of the authenticated user */
export interface CurrentUser {
  username: string;
  email: string;
  token: string;
}
