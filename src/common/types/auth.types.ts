import type { JwtPayload } from "jsonwebtoken";

export interface AuthUser extends JwtPayload {
  sub: string;
  role: string;
}
