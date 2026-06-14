import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        {
          provide: MessagesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a message', async () => {
    const payload = { content: 'hola' };
    mockService.create.mockResolvedValue({ id: '1', ...payload });

    const result = await controller.create(payload as any);

    expect(mockService.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: '1', ...payload });
  });
});
