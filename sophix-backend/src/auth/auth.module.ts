import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeyVaultService } from 'src/key-vault/key-vault.service';
import { KeyVaultModule } from 'src/key-vault/key-vault.module';


@Module({
  imports: [
    UsersModule,
    PassportModule,
    KeyVaultModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, KeyVaultModule],
      inject: [ConfigService, KeyVaultService],
      useFactory: async  (config: ConfigService,  keyVault: KeyVaultService) => ({
        secret:  
      (await keyVault.getSecret('JWTSECRET')),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,
  JwtStrategy],
})
export class AuthModule {}