import { Injectable } from '@nestjs/common';
import { FoundryProvider } from './providers/foundry.provider';
import { MessagesService } from '../messages/messages.service';
import { GithubService } from '../github/github.service';
import { EmbeddingsService } from '../github/embeddings.service';
import { QdrantService } from '../vector/qdrant.service';
import { join } from 'path/win32';

type RepositoryReference = {
  owner: string;
  repo: string;
};

@Injectable()
export class AiService {

  constructor(
    private readonly foundryProvider: FoundryProvider,
    private readonly messagesService: MessagesService,
    private readonly githubService: GithubService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly qdrantService: QdrantService,
  ) {}

async generateResponse(
  conversationId: string,
  githubUsername?: string,
) {
  
  const history = await this.messagesService.findByConversation(conversationId);
  const lastUserMessage =
    [...history]
      .reverse()
      .find((message) => message.role === 'user');

  

  let repositoryContext: string | null = null;

  if (lastUserMessage) {
    const repositoryReference = this.extractRepositoryReference(lastUserMessage.content);

    if (this.isAllRepositoriesRequest(lastUserMessage.content)) {
      if (githubUsername) {
        repositoryContext = await this.githubService.getUserRepositoriesContext(githubUsername);
      }
    } else if (repositoryReference) {

        const embedding = await this.embeddingsService.createEmbedding(
      lastUserMessage.content,
      'retrieval.query',
    );

    const matches =
      await this.qdrantService.searchByOwnerAndRepository(
        repositoryReference.owner,
        repositoryReference.repo,
        embedding,
      );

    repositoryContext = matches
      .slice(0, 3)
      .map((m) => {
        const p = m.payload as any;

        return `
FILE: ${p.path}
CODE:
${p.content?.slice(0, 3000)}
`;
      })
      .join('\n\n---\n\n');
  }

    
  }

const systemPrompt = `
Eres Sophix IA, un asistente experto en análisis de código y comprensión de repositorios.

REGLAS:
- Usa el contexto del repositorio como fuente principal.
- Si la información está parcialmente disponible, intenta razonar con lo que hay.
- No inventes funciones, archivos o código que no aparezca en el contexto.
- Si la respuesta no puede derivarse del contexto, responde: "No encontré suficiente información en el repositorio".
- No menciones modelos, empresas ni herramientas externas.
- No des información fuera del repositorio, excepto cuando el usuario pregunte cosas generales como "qué eres".

IMPORTANTE:
- Si el usuario pregunta por identidad del sistema (qué eres / quién eres), responde siempre:
  "Soy Sophix IA, un asistente de análisis de código fuente."

CONTEXTO:
${repositoryContext ?? "Sin contexto disponible."}
`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },

    ...history.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  return this.foundryProvider.generateResponse(messages);
}



private extractRepositoryReference(
  message: string,
): RepositoryReference | null {

  const urlMatch = message.match(
    /github\.com[:/]([^/\s)\]]+)\/([^/\s)\]]+?)(?:\.git)?(?=[\s)\].,;:'"]|$)/i,
  );

  if (urlMatch) {
    const [, owner, repo] = urlMatch;

    return {
      owner,
      repo,
    };
  }

  const shorthandMatch = message.match(
    /(?:^|\s)([a-z0-9_.-]+)\/([a-z0-9_.-]+(?:\.git)?)(?=[\s)\].,;:'"]|$)/i,
  );

  if (!shorthandMatch) {
    return null;
  }

  const [, owner, repo] = shorthandMatch;

  return {
    owner,
    repo,
  };

}

private isAllRepositoriesRequest(
  message: string,
): boolean {

  return /(?:todos|todas)\s+(?:mis\s+)?(?:repos|repositorios|repositories)\b/i.test(message) ||
    /\b(?:portafolio|proyectos)\s+completo\b/i.test(message);

}

async repositoryChat(
  conversationId: string,
  owner: string,
  repository: string,
  question: string,
): Promise<string> {
  await this.messagesService.create({
    content: question,
    role: 'user',
    conversation: {
      id: conversationId,
    } as any,
  });

  const embedding = await this.embeddingsService.createEmbedding(question,  'retrieval.query',);
  const matches = await this.qdrantService.searchByOwnerAndRepository(
    owner,
    repository,
    embedding,
  );

  console.log(
  'MATCHES:',
  matches.length,
);

console.log(
  'MATCHES DATA:',
  JSON.stringify(
    matches.slice(0, 2),
    null,
    2,
  ),
);

  console.log('OWNER:', owner);
console.log('REPOSITORY:', repository);
console.log('MATCHES:', matches.length);

if (matches.length > 0) {
  console.log(
    JSON.stringify(matches[0], null, 2)
  );
}
const context = matches
  .slice(0, 2)
  .map((m) => {
    const p = m.payload as any;

    return `
FILE: ${p.path}
CODE:
${(p.content ?? '').slice(0, 2000)}
`;
  })
  .join('\n\n---\n\n');

  const messages = [
    {
      role: 'system' as const,
      content: `Eres Sophix IA, un asistente experto en análisis de código.

REGLAS ESTRICTAS:
- Usa SOLO el contexto.
- No inventes información.
- Si no está en el contexto, responde: "No está en el repositorio".
- No menciones modelos como Phi, Azure o OpenAI.
- No asumas información externa.

CONTEXTO:
${context}`,
    },
    {
      role: 'user' as const,
      content: question,
    },
  ];

  console.log(
  'CONTEXT SIZE:',
  context.length,
);


console.log(
  'PROMPT:',
  JSON.stringify(
    messages,
    null,
    2,
  ),
);

  const response = await this.foundryProvider.generateResponse(messages);

  await this.messagesService.create({
    content: response,
    role: 'assistant',
    conversation: {
      id: conversationId,
    } as any,
  });

  return response;
}

}
