import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum/role.enum';

export class FilterUsersDto {
  @ApiProperty({
    description: 'Filtrar por nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  firstName?: string;

  @ApiProperty({
    description: 'Filtrar por apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto' })
  lastName?: string;

  @ApiProperty({
    description: 'Filtrar por DNI del usuario',
    example: '12345678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto' })
  dni?: string;

  @ApiProperty({
    description: 'Filtrar por email del usuario',
    example: 'juan@email.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El email debe ser un texto' })
  email?: string;

  @ApiProperty({
    description: 'Filtrar por teléfono del usuario',
    example: '+54 9 11 1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  phone?: string;

  @ApiProperty({
    description: 'Filtrar por rol del usuario',
    enum: Role,
    example: Role.CLIENT,
    enumName: 'Role',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Rol inválido. Usa ADMIN o CLIENT' })
  role?: Role;

  @ApiProperty({
    description: 'Número de página para la paginación',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  limit?: number = 10;
}
