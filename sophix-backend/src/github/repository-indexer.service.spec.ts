jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    paginate: jest.fn(),
    rest: {
      git: {
        getTree: jest.fn(),
      },
      repos: {
        get: jest.fn(),
        getContent: jest.fn(),
        listForUser: jest.fn(),
      },
    },
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingsService } from './embeddings.service';
import { GithubService } from './github.service';
import { RepositoryIndexerService } from './repository-indexer.service';
import { QdrantService } from '../vector/qdrant.service';

describe('RepositoryIndexerService', () => {
  let service: RepositoryIndexerService;
  let githubService: GithubService;
  let embeddingsService: EmbeddingsService;
  let qdrantService: QdrantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryIndexerService,
        {
          provide: GithubService,
          useValue: {
            getRepositoryChunks: jest.fn(),
          },
        },
        {
          provide: EmbeddingsService,
          useValue: {
            createEmbedding: jest.fn(),
          },
        },
        {
          provide: QdrantService,
          useValue: {
            createCollection: jest.fn(),
            storeChunk: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RepositoryIndexerService>(RepositoryIndexerService);
    githubService = module.get<GithubService>(GithubService);
    embeddingsService = module.get<EmbeddingsService>(EmbeddingsService);
    qdrantService = module.get<QdrantService>(QdrantService);
  });

  it('should index repository chunks into qdrant', async () => {
    jest.spyOn(githubService, 'getRepositoryChunks').mockResolvedValue([
      {
        repository: 'nest',
        path: 'README.md',
        content: 'hello',
      },
    ]);
    jest
      .spyOn(embeddingsService, 'createEmbedding')
      .mockResolvedValue([0.1, 0.2, 0.3]);

    const result =
      await service.indexRepositoryEmbeddings(
        'nestjs',
        'nest.git',
      );

    expect(qdrantService.createCollection).toHaveBeenCalled();
    expect(githubService.getRepositoryChunks).toHaveBeenCalledWith(
      'nestjs',
      'nest.git',
    );
    expect(embeddingsService.createEmbedding).toHaveBeenCalledWith('hello');
    expect(qdrantService.storeChunk).toHaveBeenCalledWith(
      'nest',
      'README.md',
      'hello',
      [0.1, 0.2, 0.3],
    );
    expect(result).toEqual({
      indexedChunks: 1,
    });
  });
});
