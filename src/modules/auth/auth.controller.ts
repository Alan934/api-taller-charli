// src/modules/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../../dto/auth-dto/login.dto';
import { CreateUserDto } from '../../dto/user-dto/create-user.dto';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  private isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
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
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o ya registrados' })
  async register(@Body() dto: CreateUserDto & { password: string }) {
    try {
      const user = await this.authService.register(dto);
      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user,
      };
    } catch (error) {
      if (this.isError(error)) {
        this.logger.error(
          `Registration failed for email ${dto.email}:`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Registration failed for email ${dto.email}:`,
          String(error),
        );
      }
      throw error;
    }
  }
}
