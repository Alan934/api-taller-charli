import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../user-dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: UserResponseDto,
  })
  user!: UserResponseDto;

  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'Token de actualización para renovar el acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'Nuevo token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'Nuevo token de actualización',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Información actualizada del usuario',
    type: UserResponseDto,
  })
  user!: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Indica si el logout fue exitoso',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Sesión cerrada exitosamente',
  })
  message!: string;
}
