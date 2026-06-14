import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {

  constructor(
    @InjectRepository(Message)
    private readonly repository:
      Repository<Message>,
  ) {}

  create(
    message: Partial<Message>
  ) {
    const newMessage =
      this.repository.create(message);

    return this.repository.save(
      newMessage
    );
  }

  findAll() {
    return this.repository.find({
      relations: {conversation:true},
    });
  }

  async findByConversation(
  conversationId: string,
) {
  return this.repository.find({
    where: {
      conversation: {
        id: conversationId,
      },
    },
    order: {
      createdAt: 'ASC',
    },
  });
}
}