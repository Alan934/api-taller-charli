import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum/role.enum';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  firstName!: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  lastName!: string;

  @ApiProperty({
    description: 'Documento Nacional de Identidad',
    example: '12345678',
  })
  dni!: string;

  @ApiProperty({
    description: 'Dirección de correo electrónico',
    example: 'juan.perez@email.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+54 9 11 1234-5678',
    nullable: true,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: Role,
    example: Role.CLIENT,
  })
  role!: Role;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Fecha de eliminación lógica (null si está activo)',
    example: null,
    nullable: true,
    required: false,
  })
  deletedAt?: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  users!: UserResponseDto[];

  @ApiProperty({
    description: 'Total de usuarios encontrados',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Límite de elementos por página',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total de páginas disponibles',
    example: 15,
  })
  totalPages!: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Usuario creado exitosamente',
  })
  message!: string;

  @ApiProperty({
    description: 'Datos de respuesta',
  })
  data!: T;
}
