import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { FoundryProvider } from './providers/foundry.provider';
import { AiController } from './ai.controller';
import { MessagesModule } from '../messages/messages.module';
import { GithubModule } from '../github/github.module';
import { VectorModule } from '../vector/vector.module';
import { KeyVaultModule } from 'src/key-vault/key-vault.module';
import { GroqProvider } from './providers/GroqProvider';
import { ConversationsModule } from 'src/conversations/conversations.module';

@Module({
  imports: [MessagesModule, GithubModule, VectorModule, KeyVaultModule, ConversationsModule],
  providers: [AiService, FoundryProvider,  GroqProvider],
  exports: [AiService],
  controllers: [AiController],
})
export class AiModule {}
