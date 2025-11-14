export interface JwtRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: string;
  };
}
