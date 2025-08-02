// src/user/interfaces/user.interface.ts
export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  adress?: string | null;
}

// src/user/interfaces/user.interface.ts
export interface IUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adress?: string | null;
}

export interface IUserUpdate {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
  password?: string;
  adress?: string | null;
  isConfirmed?: boolean;
}

export interface IUserprivate {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  adress?: string | null;
  role: string;
}
