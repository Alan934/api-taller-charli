import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum/role.enum';

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastName!: string;

  @ApiProperty({
    description: 'Documento Nacional de Identidad',
    example: '12345678',
    minLength: 8,
    maxLength: 10,
  })
  @IsString({ message: 'El DNI debe ser un texto' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  dni!: string;

  @ApiProperty({
    description: 'Dirección de correo electrónico',
    example: 'admin@taller.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @ApiProperty({
    description: 'Número de teléfono (opcional)',
    example: '+54 9 11 1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    example: Role.ADMIN,
    enumName: 'Role',
  })
  @IsEnum(Role, { message: 'Rol inválido. Usa ADMIN o CLIENT' })
  role!: Role;
}
