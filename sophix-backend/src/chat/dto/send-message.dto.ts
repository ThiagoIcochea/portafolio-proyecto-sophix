import {
  IsString
} from 'class-validator';

export class SendMessageDto {

  @IsString()
  conversationId!: string;

  @IsString()
  message!: string;
}