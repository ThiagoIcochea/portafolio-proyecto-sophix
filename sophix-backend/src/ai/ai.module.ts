import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { FoundryProvider } from './providers/foundry.provider';
import { AiController } from './ai.controller';
import { MessagesModule } from '../messages/messages.module';
import { GithubModule } from '../github/github.module';
import { VectorModule } from '../vector/vector.module';
import { KeyVaultModule } from 'src/key-vault/key-vault.module';

@Module({
  imports: [MessagesModule, GithubModule, VectorModule, KeyVaultModule],
  providers: [AiService, FoundryProvider],
  exports: [AiService],
  controllers: [AiController],
})
export class AiModule {}
