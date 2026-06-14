import path from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { GithubModule } from './github/github.module';
import { KeyVaultModule } from './key-vault/key-vault.module';
import { KeyVaultService } from './key-vault/key-vault.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '.env'),
    }),

    KeyVaultModule,

  

TypeOrmModule.forRootAsync({
  imports: [KeyVaultModule],
  inject: [KeyVaultService],
  useFactory: async (
    
    keyVault: KeyVaultService,
  ) => {
    const databaseUrl =
      (await keyVault.getSecret('DATABASEURL'));
    

    return {
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
  rejectUnauthorized: false,
},
    };
  },
})
    ,
     UsersModule,
     AuthModule,
     ConversationsModule,
     MessagesModule,
     ChatModule,
     AiModule,
     GithubModule
  ]
})
export class AppModule {}