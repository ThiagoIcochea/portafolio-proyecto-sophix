import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { GithubService } from './github.service';
import { QdrantService } from '../vector/qdrant.service';

@Injectable()
export class RepositoryIndexerService {

  constructor(
    @Inject(forwardRef(() => GithubService))
    private readonly githubService: GithubService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly qdrantService: QdrantService,
  ) {}

  async indexRepositoryEmbeddings(
    owner: string,
    repo: string,
  ) {

    await this.qdrantService.createCollection();

    const chunks =
      await this.githubService.getRepositoryChunks(
        owner,
        repo,
      );

    for (const chunk of chunks) {

      const embedding =
        await this.embeddingsService
          .createEmbedding(
            chunk.content,
          );

      await this.qdrantService
        .storeChunk(
          chunk.owner,
          chunk.repository,
          chunk.path,
          chunk.content,
          embedding,
        );

    }

    return {
      indexedChunks:
        chunks.length,
    };

  }

 async reindexRepositoryEmbeddings(
  owner: string,
  repo: string,
) {

  console.log('REINDEXANDO:', owner, repo);

  await this.qdrantService.createCollection();

  await this.qdrantService.deleteByOwnerAndRepository(
    owner,
    repo,
  );

  const chunks =
    await this.githubService.getRepositoryChunks(
      owner,
      repo,
    );

  console.log(
    'CHUNKS ENCONTRADOS:',
    chunks.length,
  );

  for (const chunk of chunks) {

    console.log(
      'PROCESANDO:',
      chunk.path,
    );

    const embedding =
      await this.embeddingsService.createEmbedding(
        chunk.content,
      );

    console.log(
      'EMBEDDING SIZE:',
      embedding.length,
    );

    await this.qdrantService.storeChunk(
      chunk.owner,
      chunk.repository,
      chunk.path,
      chunk.content,
      embedding,
    );
  }

  console.log(
    'REINDEX TERMINADO'
  );

  return {
    reindexedChunks: chunks.length,
  };
}

}