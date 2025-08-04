import { Module } from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseAuthService],
  exports: [SupabaseAuthService],
})
export class SupabaseAuthModule {}
