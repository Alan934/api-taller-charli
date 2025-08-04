import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthService } from '../modules/supabase-auth/supabase-auth.service';
import { UserService } from '../modules/user/user.service';

interface AuthenticatedRequest extends Request {
  user?: {
    supabaseUser: any;
    localUser: any;
    id: number;
    email: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private supabaseAuth: SupabaseAuthService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      // Verificar token con Supabase
      const supabaseUser = await this.supabaseAuth.verifyToken(token);

      if (!supabaseUser) {
        throw new UnauthorizedException('Token inválido');
      }

      // Obtener datos del usuario desde la base de datos local
      const localUser = await this.userService.findByEmail(supabaseUser.email!);

      if (!localUser) {
        throw new UnauthorizedException(
          'Usuario no encontrado en la base de datos local',
        );
      }

      // Agregar tanto el usuario de Supabase como el local al request
      request.user = {
        supabaseUser,
        localUser,
        id: localUser.id,
        email: localUser.email,
        role: localUser.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
