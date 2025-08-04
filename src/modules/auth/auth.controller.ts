// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../../dto/auth-dto/login.dto';
import { RegisterDto } from '../../dto/auth-dto/register.dto';
import { UserResponseDto, ApiResponseDto } from '../../dto/user-dto/user-response.dto';

// Definir DTO de respuesta para login
export class LoginResponseDto {
  user!: UserResponseDto;
  token!: string;
  refreshToken!: string;
}

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña, devuelve el usuario y tokens de acceso.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciales de usuario',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: ApiResponseDto<LoginResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      };
    } catch (error) {
      if (this.isError(error)) {
        this.logger.error(
          `Login failed for email ${loginDto.email}:`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Login failed for email ${loginDto.email}:`,
          String(error),
        );
      }
      throw error;
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario con rol CLIENT. Registra en Supabase Auth y crea el perfil en la base de datos local.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Datos del nuevo usuario',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o email/DNI ya registrados',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email o DNI ya está registrado',
  })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user,
      };
    } catch (error) {
      if (this.isError(error)) {
        this.logger.error(
          `Registration failed for email ${registerDto.email}:`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Registration failed for email ${registerDto.email}:`,
          String(error),
        );
      }
      throw error;
    }
  }
}
