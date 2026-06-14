import { forwardRef, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Octokit } from 'octokit';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from './embeddings.service';
import { RepositoryIndexerService } from './repository-indexer.service';
import { QdrantService } from 'src/vector/qdrant.service';
import { KeyVaultService } from 'src/key-vault/key-vault.service';

type GithubRepositoryDocument = {
  owner: string;
  repository: string;
  path: string;
  content: string;
};

type RepositoryFile = {
  path?: string;
  type?: string;
};

@Injectable()
export class GithubService  implements OnModuleInit {

  

    private octokit!: Octokit;

   private readonly allowedExtensions = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.md',
    '.yml',
    '.yaml',
    '.py',
    '.php',
    '.java',
    '.go',
    '.rs',
    '.c',
    '.cpp',
    '.cs',
    '.sql',
    '.sh',
    '.env',
    '.toml',
    '.ini',
    '.xml',
    '.html',
    '.css',
    '.scss',
    '.less',
    '.txt',
    '.dockerfile',
  ];

  constructor(
    private readonly chunkingService: ChunkingService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly qdrantService: QdrantService,
    private readonly keyVault: KeyVaultService,
    
    @Inject(forwardRef(() => RepositoryIndexerService))
    private readonly repositoryIndexerService: RepositoryIndexerService,
  ) {

   

  }

  async onModuleInit() {
    
    const GitHubToken =  await this.keyVault.getSecret('GITHUBTOKEN');
     this.octokit = new Octokit({
      auth: GitHubToken,
    });
  }

  private normalizeRepositoryName(
    repo: string,
  ): string {

    return repo
      .trim()
      .replace(/[\])>.,;:'"]+$/g, '')
      .replace(/\/+$/g, '')
      .replace(/\.git$/i, '');

  }

  async getUserRepos(
    username: string,
  ) {

    const repos =
      await this.octokit.paginate(
        this.octokit.rest.repos.listForUser,
        {
          username,
          per_page: 100,
        },
      );

    return repos;

  }

  async getRepositoryTree(
  owner: string,
  repo: string,
) {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  try {

    const branch =
      await this.octokit.rest.repos.get({
        owner,
        repo: normalizedRepo,
      });

    const tree =
      await this.octokit.rest.git.getTree({
        owner,
        repo: normalizedRepo,
        tree_sha:
          branch.data.default_branch,
        recursive: 'true',
      });

    return tree.data.tree;

  } catch (error: any) {

    if (error?.status === 404) {
      throw new NotFoundException(
        `No se encontro el repositorio ${owner}/${normalizedRepo}. Verifica que exista o que tu GITHUB_TOKEN tenga acceso.`,
      );
    }

    throw error;

  }

}

private isAllowedFile(
  path: string,
): boolean {

  const ignoredFolders = [
    '.github/',
    '.circleci/',
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    '.next/',
    '.nuxt/',
  ];

  const ignoredFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
  ];

  if (
    ignoredFolders.some(folder =>
      path.startsWith(folder),
    )
  ) {
    return false;
  }

  if (
    ignoredFiles.some(file =>
      path.endsWith(file),
    )
  ) {
    return false;
  }

  return this.allowedExtensions.some(
    ext => path.endsWith(ext),
  );

}


async indexRepository(
  owner: string,
  repo: string,
) {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const files =
    await this.getRepositoryFiles(
      owner,
      normalizedRepo,
    );

  const documents: GithubRepositoryDocument[] = [];

  for (const file of files) {
    if (!file.path) {
      continue;
    }

    try {

      const content =
        await this.getFileContent(
          owner,
          normalizedRepo,
          file.path,
        );

      documents.push({
        owner: owner,
        repository: normalizedRepo,
        path: file.path,
        content,
      });

    } catch {

      continue;

    }

  }

  return documents;

}

async indexUser(
  username: string,
) {

  const repos =
    await this.getUserRepos(
      username,
    );

  const documents: GithubRepositoryDocument[] = [];

  for (const repo of repos) {

    const repoDocs =
      await this.indexRepository(
        username,
        repo.name,
      );

    documents.push(
      ...repoDocs,
    );

  }

  return documents;

}

async getFileContent(
  owner: string,
  repo: string,
  path: string,
): Promise<string> {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const file =
    await this.octokit.rest.repos.getContent({
      owner,
      repo: normalizedRepo,
      path,
    });

  if (
    !Array.isArray(file.data) &&
    'content' in file.data
  ) {

    return Buffer.from(
      file.data.content,
      'base64',
    ).toString('utf8');

  }

  return '';

}

async getRepositoryFiles(
  owner: string,
  repo: string,
) {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const tree =
    await this.getRepositoryTree(
      owner,
      normalizedRepo,
    );

  return tree.filter(
    (file: RepositoryFile) =>
      file.type === 'blob' &&
      file.path &&
      this.isAllowedFile(file.path),
  );

}

async getRepositoryContext(
  owner: string,
  repo: string,
): Promise<string> {
  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const files = await this.getRepositoryFiles(owner, normalizedRepo);

  if (!files.length) {
    return `No se encontraron archivos legibles en ${owner}/${normalizedRepo}.`;
  }

  const selectedFiles = files
    .slice()
    .sort((a, b) => this.getFilePriority(a.path ?? '') - this.getFilePriority(b.path ?? '') || (a.path ?? '').localeCompare(b.path ?? ''))
    .slice(0, 20);
  const contextParts: string[] = [];

  for (const file of selectedFiles) {
    if (!file.path) {
      continue;
    }

    try {
      const content = await this.getFileContent(owner, normalizedRepo, file.path);
      const normalized = content.replace(/\s+/g, ' ').trim();

      if (!normalized) {
        continue;
      }

      const maxChars = 4000;
      const snippet = normalized.length > maxChars
        ? `${normalized.slice(0, maxChars)}…`
        : normalized;

      contextParts.push(`Archivo: ${file.path}\n\n${snippet}`);
    } catch {
      continue;
    }
  }

  if (!contextParts.length) {
    return `No se pudo leer ningún archivo válido de ${owner}/${repo}.`;
  }

  return `Contexto del repositorio ${owner}/${repo}:\n\n${contextParts.join('\n\n')}`;
}

async getUserRepositoriesContext(
  username: string,
  maxRepos = 5,
): Promise<string> {

  const repos =
    await this.getUserRepos(
      username,
    );

  const selectedRepos =
    repos
      .filter(repo => !repo.fork)
      .slice(0, maxRepos);

  if (!selectedRepos.length) {
    return `No se encontraron repositorios analizables para ${username}.`;
  }

  const contextParts: string[] = [];

  for (const repo of selectedRepos) {

    try {

      const context =
        await this.getRepositoryContext(
          username,
          repo.name,
        );

      contextParts.push(context);

    } catch {

      continue;

    }

  }

  if (!contextParts.length) {
    return `No se pudo leer ningun repositorio valido de ${username}.`;
  }

  return `Contexto de repositorios de ${username}:\n\n${contextParts.join('\n\n---\n\n')}`;

}


private getFilePriority(path: string): number {
  const normalized = path.toLowerCase();

  if (normalized.includes('readme')) {
    return 0;
  }

  if (normalized.includes('package.json') || normalized.includes('tsconfig') || normalized.includes('vite.config') || normalized.includes('next.config')) {
    return 1;
  }

  if (normalized.includes('src/')) {
    return 2;
  }

  return 3;
}

async analyzeRepository(
  owner: string,
  repo: string,
) {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const files =
    await this.getRepositoryFiles(
      owner,
      normalizedRepo,
    );

  const result: {
    path: string;
    content: string;
  }[] = [];

  const selectedFiles = files
    .slice()
    .sort((a, b) => this.getFilePriority(a.path ?? '') - this.getFilePriority(b.path ?? '') || (a.path ?? '').localeCompare(b.path ?? ''))
    .slice(0, 20);

  for (const file of selectedFiles) {
    if (!file.path) {
      continue;
    }

    try {
      const content =
        await this.getFileContent(
          owner,
          normalizedRepo,
          file.path,
        );

      const normalized = content.replace(/\s+/g, ' ').trim();

      result.push({
        path: file.path,
        content: normalized.length > 4000
          ? `${normalized.substring(0, 4000)}…`
          : normalized,
      });
    } catch {
      continue;
    }
  }

  return result;

}

async getRepositoryChunks(
  owner: string,
  repo: string,
) {

  const normalizedRepo =
    this.normalizeRepositoryName(repo);

  const documents =
    await this.indexRepository(
      owner,
      normalizedRepo,
    );

  const chunks: GithubRepositoryDocument[] = [];

  for (const document of documents) {

    const pieces =
      this.chunkingService.chunkText(
        document.content,
      );

    for (const chunk of pieces) {

      chunks.push({
        owner: owner,
        repository:
          document.repository,
        path:
          document.path,
        content:
          chunk,
      });

    }

  }

  return chunks;

}


async indexRepositoryEmbeddings(
  owner: string,
  repo: string,
) {
  return this.repositoryIndexerService.indexRepositoryEmbeddings(owner, repo);
}

}
