import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Role } from '../../enum/role.enum';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @IsString({ message: 'El DNI debe ser un texto' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dni!: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @IsEnum(Role, { message: 'Rol inválido. Usa ADMIN o CLIENT' })
  role!: Role;
}
