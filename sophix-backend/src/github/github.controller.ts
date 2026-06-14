import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentGithubUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { GithubService } from './github.service';
import { EmbeddingsService } from './embeddings.service';
import { RepositoryIndexerService } from './repository-indexer.service';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly repositoryIndexerService: RepositoryIndexerService,
  ) {}

  

  @Get('repos')
  @UseGuards(JwtAuthGuard)
  getMyRepos(
    @CurrentUser() user: CurrentGithubUser,
  ) {
    return this.githubService.getUserRepos(
      user.githubUsername,
    );
  }

  @Get('repos/:repo/tree')
  @UseGuards(JwtAuthGuard)
  getMyRepoTree(
    @CurrentUser() user: CurrentGithubUser,
    @Param('repo') repo: string,
  ) {
    return this.githubService.getRepositoryTree(
      user.githubUsername,
      repo,
    );
  }

  @Get('repos/:repo/files')
  @UseGuards(JwtAuthGuard)
  getMyRepoFiles(
    @CurrentUser() user: CurrentGithubUser,
    @Param('repo') repo: string,
  ) {
    return this.githubService.getRepositoryFiles(
      user.githubUsername,
      repo,
    );
  }

  @Get('repos/:repo/analyze')
  @UseGuards(JwtAuthGuard)
  analyzeMyRepo(
    @CurrentUser() user: CurrentGithubUser,
    @Param('repo') repo: string,
  ) {
    return this.githubService.analyzeRepository(
      user.githubUsername,
      repo,
    );
  }

  @Get('repos/:repo/index')
  @UseGuards(JwtAuthGuard)
  indexMyRepo(
    @CurrentUser() user: CurrentGithubUser,
    @Param('repo') repo: string,
  ) {
    return this.githubService.indexRepository(
      user.githubUsername,
      repo,
    );
  }
 @Post('embedding-test')
  async embeddingTest() {

    const vector =
      await this.embeddingsService.createEmbedding(
        'hola mundo',
      );

    return {
      dimensions: vector.length,
    };

  }

  @Post('index-test')
  indexRepoForTesting(
    @Body() body: {
      owner?: string;
      repo?: string;
    },
  ) {

    if (!body.owner || !body.repo) {
      throw new BadRequestException(
        'Envia owner y repo. Ejemplo: { "owner": "nestjs", "repo": "nest" }',
      );
    }

    return this.repositoryIndexerService
      .indexRepositoryEmbeddings(
        body.owner,
        body.repo,
      );

  }



@Post('repos/:repo/index')
indexRepo(
  @CurrentUser() user: CurrentGithubUser,
  @Param('repo') repo: string,
) {

  return this.githubService
    .indexRepositoryEmbeddings(
      user.githubUsername,
      repo,
    );

}

@Post('reindex')
async reindexRepository(
  @Body() body: { owner?: string; repository?: string },
) {
  if (!body.owner || !body.repository) {
    throw new BadRequestException(
      'Envia owner y repository. Ejemplo: { "owner": "nestjs", "repository": "nest" }',
    );
  }

  return this.repositoryIndexerService.reindexRepositoryEmbeddings(
    body.owner,
    body.repository,
  );
}
}
