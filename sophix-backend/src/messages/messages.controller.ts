import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';

import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {

  constructor(
    private readonly service:
      MessagesService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }
}