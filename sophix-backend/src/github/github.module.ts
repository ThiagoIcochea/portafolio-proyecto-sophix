import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from './embeddings.service';
import { RepositoryIndexerService } from './repository-indexer.service';
import { VectorModule } from '../vector/vector.module';
import { KeyVaultModule } from 'src/key-vault/key-vault.module';

@Module({
  imports: [VectorModule, KeyVaultModule],
  providers: [
    GithubService,
    ChunkingService,
    EmbeddingsService,
    RepositoryIndexerService,
  ],
  controllers: [GithubController],
  exports: [
    GithubService,
    ChunkingService,
    EmbeddingsService,
    RepositoryIndexerService,
  ],
})
export class GithubModule {}
