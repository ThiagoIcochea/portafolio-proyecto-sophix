import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation } from './entities/conversation.entity';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [TypeOrmModule,ConversationsService]
})
export class ConversationsModule {}