import {
  Body,
  Controller,
  Post,
   UseGuards,
   Get,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { GithubAuthDto } from './dto/github-auth.dto';
import { JwtAuthGuard } from './guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService
  ) {}

@Post('github')
githubLogin(
  @Body() githubAuthDto: GithubAuthDto
) {
  return this.authService.githubLogin(
    githubAuthDto
  );
}

@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Req() req: any) {
  return req.user;
}
}
