import { IsString } from 'class-validator';

export class GithubAuthDto {
  @IsString()
  code!: string;

  @IsString()
  codeVerifier!: string;
}