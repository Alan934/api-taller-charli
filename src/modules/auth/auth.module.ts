import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAuthModule } from '../supabase-auth/supabase-auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SupabaseAuthModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
