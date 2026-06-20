import {
  Body,
  Controller,
  Get,
  Post
} from '@nestjs/common';

import { ConversationsService } from './conversations.service';

import { UseGuards } from '@nestjs/common';

import {JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';
import type { CurrentGithubUser }
from '../auth/decorators/current-user.decorator';

@Controller('conversations')
export class ConversationsController {

  constructor(
    private readonly service:
      ConversationsService
  ) {}

 @Get()
@UseGuards(JwtAuthGuard)
findMyConversations(
  @CurrentUser() user: CurrentGithubUser,
) {

  return this.service.findByUser(
    user.id,
  );
}
 @Post()
@UseGuards(JwtAuthGuard)
create(
  @Body() body: any,
  @CurrentUser() user: CurrentGithubUser,
) {

  return this.service.create(
    body.title,
    user.id,
    body.model,
  );
}
}
