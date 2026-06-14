import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { QdrantService } from '../vector/qdrant.service';
import { RepositoryChatDto } from './dto/repository-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {

  constructor(
    private readonly aiService: AiService,
    private readonly qdrantService: QdrantService,
  ) {}

  @Post('test')
  async test(
    @Body() body: {
      conversationId: string;
    },
  ) {

    const response =
      await this.aiService.generateResponse(
        body.conversationId,
      );

    return {
      response,
    };
  }

  @Post('qdrant-init')
  async initQdrant() {

    await this.qdrantService
      .createCollection();

    return {
      success: true,
    };

  }

  @Post('repository-chat')
  async repositoryChat(
    @Body() dto: RepositoryChatDto,
  ) {
    const response = await this.aiService.repositoryChat(
      dto.conversationId,
      dto.owner,
      dto.repository,
      dto.question,
    );

    return {
      response,
    };
  }
}
