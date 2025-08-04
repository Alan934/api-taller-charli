import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from '../../dto/auth-dto/login.dto';
import { SupabaseAuthService } from '../supabase-auth/supabase-auth.service';
import { UserService } from '../user/user.service';
import { User } from '../../interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private supabaseAuth: SupabaseAuthService,
    private userService: UserService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> {
    const { email, password } = loginDto;

    try {
      // Intentar iniciar sesión en Supabase
      const sessionData = await this.supabaseAuth.signIn(email, password);

      if (!sessionData || !sessionData.session) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      // Buscar usuario en la base de datos local
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException(
          'Usuario no encontrado en la base de datos local',
        );
      }

      return {
        user,
        token: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Error al iniciar sesión`);
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
    user: User;
  }> {
    try {
      const sessionData = await this.supabaseAuth.refreshToken(refreshToken);

      if (!sessionData || !sessionData.session) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Obtener usuario actualizado
      const supabaseUser = await this.supabaseAuth.verifyToken(
        sessionData.session.access_token,
      );

      if (!supabaseUser) {
        throw new UnauthorizedException('Token inválido después del refresh');
      }

      const user = await this.userService.findByEmail(supabaseUser.email!);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        token: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al refrescar token');
    }
  }

  async logout(accessToken: string): Promise<{ success: boolean }> {
    try {
      await this.supabaseAuth.signOut(accessToken);
      return { success: true };
    } catch {
      throw new BadRequestException('Error al cerrar sesión');
    }
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    try {
      const supabaseUser = await this.supabaseAuth.getCurrentUser(accessToken);

      if (!supabaseUser) {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.userService.findByEmail(supabaseUser.email!);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener usuario actual');
    }
  }

  async register(
    dto: LoginDto & {
      firstName: string;
      lastName: string;
      dni: string;
      phone?: string;
    },
  ): Promise<User> {
    const { email, password, firstName, lastName, dni, phone } = dto;

    try {
      // Registrar en Supabase
      const signUpResponse = await this.supabaseAuth.signUp(email, password);
      if (!signUpResponse) {
        throw new BadRequestException('Error al crear usuario');
      }

      // Crear usuario en base de datos local
      const user = await this.userService.create({
        firstName,
        lastName,
        dni,
        email,
        phone,
      });

      return user;
    } catch (error) {
      // Si falla, podrías querer deshacer el registro en Supabase (opcional)
      if (error instanceof Error && error.message.includes('P2002')) {
        throw new BadRequestException('El email o DNI ya está registrado');
      }
      throw new BadRequestException(
        `Error al registrar usuario: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
