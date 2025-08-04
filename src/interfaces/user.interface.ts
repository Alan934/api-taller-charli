export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
