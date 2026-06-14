import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: { sendMessage: jest.Mock };

  beforeEach(() => {
    chatService = {
      sendMessage: jest.fn(),
    };

    gateway = new ChatGateway(chatService as unknown as ChatService);
  });

  it('should join a conversation room', () => {
    const client = {
      join: jest.fn(),
      emit: jest.fn(),
    } as any;

    gateway.handleJoinConversation('conversation-1', client);

    expect(client.join).toHaveBeenCalledWith('conversation-1');
  });
});
