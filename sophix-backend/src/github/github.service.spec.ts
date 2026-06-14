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
import { GithubService } from './github.service';
import { ChunkingService } from './chunking.service';

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService, ChunkingService],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build a repository context with file paths and contents', async () => {
    jest.spyOn(service, 'getRepositoryFiles').mockResolvedValue([
      { path: 'README.md', type: 'blob' } as any,
      { path: 'src/app.ts', type: 'blob' } as any,
    ]);

    jest
      .spyOn(service, 'getFileContent')
      .mockResolvedValueOnce('# Project')
      .mockResolvedValueOnce('export const app = true;');

    const context = await service.getRepositoryContext('octo', 'hello');

    expect(context).toContain('README.md');
    expect(context).toContain('# Project');
    expect(context).toContain('src/app.ts');
    expect(context).toContain('export const app = true;');
  });

  it('should normalize git repository urls before building chunks', async () => {
    const indexRepositorySpy = jest
      .spyOn(service, 'indexRepository')
      .mockResolvedValue([
        {
          repository: 'nest',
          path: 'README.md',
          content: 'hello from nest',
        },
      ] as any);

    const chunks = await service.getRepositoryChunks('nestjs', 'nest.git)');

    expect(indexRepositorySpy).toHaveBeenCalledWith('nestjs', 'nest');
    expect(chunks).toEqual([
      {
        repository: 'nest',
        path: 'README.md',
        content: 'hello from nest',
      },
    ]);
  });
});
