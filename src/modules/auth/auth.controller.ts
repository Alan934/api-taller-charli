// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../../dto/auth-dto/login.dto';
import { RegisterDto } from '../../dto/auth-dto/register.dto';
import { RefreshTokenDto } from '../../dto/auth-dto/refresh-token.dto';
import {
  LoginResponseDto,
  RefreshResponseDto,
  LogoutResponseDto,
} from '../../dto/auth-dto/auth-response.dto';
import {
  UserResponseDto,
  ApiResponseDto,
} from '../../dto/user-dto/user-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import type { AuthenticatedUser } from '../../interfaces/auth.interface';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario con email y contraseña, devuelve el usuario y tokens de acceso.',
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
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: result.user as UserResponseDto,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      };
    } catch (error) {
      this.logger.error(
        `Login failed for email ${loginDto.email}:`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una nueva cuenta de usuario con rol CLIENT. Registra en Supabase Auth y crea el perfil en la base de datos local.',
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
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    try {
      const user = await this.authService.register(registerDto);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user as UserResponseDto,
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for email ${registerDto.email}:`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description:
      'Genera un nuevo token de acceso usando el refresh token. Útil para mantener la sesión activa.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token para generar nuevo access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refrescado exitosamente',
    type: ApiResponseDto<RefreshResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido o expirado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponseDto<RefreshResponseDto>> {
    try {
      const result = await this.authService.refreshToken(
        refreshTokenDto.refreshToken,
      );
      return {
        success: true,
        message: 'Token refrescado exitosamente',
        data: {
          token: result.token,
          refreshToken: result.refreshToken,
          user: result.user as UserResponseDto,
        },
      };
    } catch (error) {
      this.logger.error(
        'Token refresh failed:',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token de acceso actual del usuario.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión cerrada exitosamente',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acceso inválido',
  })
  async logout(
    @Headers('authorization') authorization: string,
  ): Promise<LogoutResponseDto> {
    try {
      const token = this.extractTokenFromHeader(authorization);
      await this.authService.logout(token);
      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      this.logger.error(
        'Logout failed:',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description:
      'Retorna la información del usuario autenticado basada en el token de acceso.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario obtenido exitosamente',
    type: ApiResponseDto<UserResponseDto>,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acceso inválido',
  })
  getCurrentUser(
    @GetUser() user: AuthenticatedUser,
  ): ApiResponseDto<UserResponseDto> {
    return {
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: user.localUser as UserResponseDto,
    };
  }

  /**
   * Extrae el token del header Authorization
   * @private
   */
  private extractTokenFromHeader(authorization: string): string {
    if (!authorization) {
      throw new Error('Authorization header is required');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new Error('Bearer token is required');
    }

    return token;
  }
}
