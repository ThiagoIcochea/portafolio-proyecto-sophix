import { Injectable } from '@nestjs/common';

import { MessagesService } from '../messages/messages.service';

import  {AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {

  constructor(
    private readonly messagesService:
      MessagesService,
    private readonly aiService: AiService,
  ) {}

  async sendMessage(
    conversationId: string,
    message: string,
    githubUsername?: string,
  ) {

    await this.messagesService.create({
      content: message,
      role: 'user',
      conversation: {
        id: conversationId,
      } as any,
    });

  const aiResponse =
  await this.aiService.generateResponse(
    conversationId,
    githubUsername,
  );

    await this.messagesService.create({
      content: aiResponse,
      role: 'assistant',
      conversation: {
        id: conversationId,
      } as any,
    });

    return {
      response: aiResponse,
    };
  }

 async ask(
  owner: string,
  repository: string,
  question: string,
  githubUsername?: string,
) {
  return this.aiService.generateDirectResponse(
    owner,
    repository,
    question,
    githubUsername,
  );
}
  
}
