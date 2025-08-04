import type { Role } from '../enum/role.enum';
import type { User } from './user.interface';

export interface AuthenticatedUser {
  supabaseUser: any;
  localUser: User;
  id: number;
  email: string;
  role: Role;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
}