import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server?: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    client.emit('connected', { status: 'connected' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(conversationId);
    client.emit('joinedConversation', { conversationId });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.conversationId).emit('typing', {
      conversationId: payload.conversationId,
      isTyping: payload.isTyping,
      userId: client.id,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: { conversationId: string; message: string; githubUsername?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const response = await this.chatService.sendMessage(
      payload.conversationId,
      payload.message,
      payload.githubUsername,
    );

    this.server?.to(payload.conversationId).emit('messageReceived', {
      conversationId: payload.conversationId,
      role: 'assistant',
      content: response.response,
      createdAt: new Date().toISOString(),
    });

    client.emit('messageSent', {
      conversationId: payload.conversationId,
      role: 'user',
      content: payload.message,
      createdAt: new Date().toISOString(),
    });
  }
}
