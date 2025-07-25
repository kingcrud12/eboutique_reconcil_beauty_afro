// src/common/interfaces/user-jwt.interface.ts
export interface IUserJwt {
  sub: number;
  email: string;
  role?: string;
}
