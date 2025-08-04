import { Role } from '../enum/role.enum';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
