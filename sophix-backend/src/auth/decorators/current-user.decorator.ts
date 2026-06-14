import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';

export type CurrentGithubUser = {
  id: string;
  githubId: string;
  githubUsername: string;
};

export const CurrentUser =
  createParamDecorator(
    (
      data: unknown,
      ctx: ExecutionContext,
    ): CurrentGithubUser => {

      const request =
        ctx.switchToHttp().getRequest();

      return request.user;
    },
  );
