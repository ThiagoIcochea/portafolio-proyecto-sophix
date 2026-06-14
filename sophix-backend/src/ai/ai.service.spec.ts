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
import { AiService } from './ai.service';
import { FoundryProvider } from './providers/foundry.provider';
import { MessagesService } from '../messages/messages.service';
import { GithubService } from '../github/github.service';

describe('AiService', () => {
  let service: AiService;
  let foundryProvider: FoundryProvider;
  let messagesService: MessagesService;
  let githubService: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: FoundryProvider,
          useValue: {
            generateResponse: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: {
            findByConversation: jest.fn(),
          },
        },
        {
          provide: GithubService,
          useValue: {
            getRepositoryContext: jest.fn(),
            getUserRepositoriesContext: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    foundryProvider = module.get<FoundryProvider>(FoundryProvider);
    messagesService = module.get<MessagesService>(MessagesService);
    githubService = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should include repository context from a GitHub url', async () => {
    jest.spyOn(messagesService, 'findByConversation').mockResolvedValue([
      {
        content: 'analiza https://github.com/nestjs/nest.git',
        role: 'user',
      },
    ] as any);
    jest
      .spyOn(githubService, 'getRepositoryContext')
      .mockResolvedValue('repo context');
    jest
      .spyOn(foundryProvider, 'generateResponse')
      .mockResolvedValue('analysis');

    const response = await service.generateResponse('conversation-id');

    expect(githubService.getRepositoryContext).toHaveBeenCalledWith(
      'nestjs',
      'nest',
    );
    expect(foundryProvider.generateResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('repo context'),
        }),
      ]),
    );
    expect(response).toBe('analysis');
  });

  it('should include repository context from owner/repo shorthand', async () => {
    jest.spyOn(messagesService, 'findByConversation').mockResolvedValue([
      {
        content: 'haz un analisis de nestjs/nest',
        role: 'user',
      },
    ] as any);
    jest
      .spyOn(githubService, 'getRepositoryContext')
      .mockResolvedValue('repo context');
    jest
      .spyOn(foundryProvider, 'generateResponse')
      .mockResolvedValue('analysis');

    await service.generateResponse('conversation-id');

    expect(githubService.getRepositoryContext).toHaveBeenCalledWith(
      'nestjs',
      'nest',
    );
  });

  it('should include user repositories context for all repositories requests', async () => {
    jest.spyOn(messagesService, 'findByConversation').mockResolvedValue([
      {
        content: 'analiza todos mis repositorios',
        role: 'user',
      },
    ] as any);
    jest
      .spyOn(githubService, 'getUserRepositoriesContext')
      .mockResolvedValue('all repos context');
    jest
      .spyOn(foundryProvider, 'generateResponse')
      .mockResolvedValue('analysis');

    await service.generateResponse('conversation-id', 'thico');

    expect(githubService.getUserRepositoriesContext).toHaveBeenCalledWith(
      'thico',
    );
    expect(githubService.getRepositoryContext).not.toHaveBeenCalled();
  });
});
