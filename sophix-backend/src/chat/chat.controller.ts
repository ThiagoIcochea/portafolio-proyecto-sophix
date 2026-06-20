import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentGithubUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {

  constructor(
    private readonly chatService:
      ChatService
  ) {}

  @Post()
  sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: CurrentGithubUser,
  ) {
    return this.chatService.sendMessage(
      dto.conversationId,
      dto.message,
      user.githubUsername,
    );
  }

    @Post('ask')
  ask(
    @Body() dto: { message: string },
    @CurrentUser() user: CurrentGithubUser,
  ) {
    return this.chatService.ask(
      dto.message,
      user.githubUsername,
    );
  }
}
