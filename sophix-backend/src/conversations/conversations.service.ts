import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationsService {

  constructor(
    @InjectRepository(Conversation)
    private readonly repository:
      Repository<Conversation>,
  ) {}

 async create(
  title: string,
  userId: string,
) {

  const conversation =
    this.repository.create({
      title,
      user: {
        id: userId,
      } as any,
    });

  return this.repository.save(
    conversation,
  );
}

  findAll() {
    return this.repository.find({
      relations: { user: true },
    });
  }

  findOne(conversationId: string) {
  return this.repository.findOne({
    where: { id: conversationId },
  });
}

  findByUser(userId: string) {

  return this.repository.find({
    where: {
      user: {
        id: userId,
      },
    },
    order: {
      updatedAt: 'DESC',
    },
  });
}

async findOneByUser(
  conversationId: string,
  userId: string,
) {
  return this.repository.findOne({
    where: {
      id: conversationId,
      user: {
        id: userId,
      },
    },
  });
}
}