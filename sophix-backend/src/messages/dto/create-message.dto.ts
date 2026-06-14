import {
  IsString
} from 'class-validator';

export class CreateMessageDto {

  @IsString()
  content!: string;

  @IsString()
  role!: string;

  @IsString()
  conversationId!: string;
}