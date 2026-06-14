import { IsString, IsNotEmpty } from 'class-validator';

export class RepositoryChatDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;

  @IsString()
  @IsNotEmpty()
  owner!: string;

  @IsString()
  @IsNotEmpty()
  repository!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;
}
