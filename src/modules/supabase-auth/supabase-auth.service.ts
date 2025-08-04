import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseAuthService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be defined in environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    return data;
  }

  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) return null;
    return data.user;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw new Error(error.message);

    return data;
  }

  async signOut(accessToken: string) {
    // Configurar el cliente con el token del usuario
    const { error } = await this.supabase.auth.signOut();
    
    if (error) throw new Error(error.message);
    
    return { success: true };
  }

  async getCurrentUser(accessToken: string) {
    // Crear una instancia temporal con el token del usuario
    const supabaseWithAuth = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const { data, error } = await supabaseWithAuth.auth.getUser();
    
    if (error) return null;
    
    return data.user;
  }
}
