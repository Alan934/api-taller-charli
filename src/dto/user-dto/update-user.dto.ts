import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum/role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    minLength: 1,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  lastName?: string;

  @ApiProperty({
    description: 'Documento Nacional de Identidad',
    example: '12345678',
    minLength: 8,
    maxLength: 10,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto' })
  dni?: string;

  @ApiProperty({
    description: 'Dirección de correo electrónico',
    example: 'juan.perez@email.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+54 9 11 1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    example: Role.CLIENT,
    enumName: 'Role',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido. Usa ADMIN o CLIENT' })
  role?: Role;
}
