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
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { QdrantService } from '../vector/qdrant.service';

describe('AiController', () => {
  let controller: AiController;
  let qdrantService: QdrantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            generateResponse: jest.fn(),
          },
        },
        {
          provide: QdrantService,
          useValue: {
            createCollection: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    qdrantService = module.get<QdrantService>(QdrantService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should initialize qdrant collection', async () => {
    const createCollectionSpy =
      jest.spyOn(qdrantService, 'createCollection')
        .mockResolvedValue(undefined);

    await expect(controller.initQdrant()).resolves.toEqual({
      success: true,
    });
    expect(createCollectionSpy).toHaveBeenCalled();
  });
});
